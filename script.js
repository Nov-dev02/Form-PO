const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxte5kTB8H88pQ2DKUp4CE0mrnu_3egJhvfApOuERvUOrLKKGrumrf0IVvhRlCpEJktNQ/exec";

let masterBarang = [];
let selectedItemData = null;
let html5QrCode = null;
let isScannerActive = false;

function getLocalDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

window.onload = function() {
    const today = getLocalDateString();
    if (document.getElementById('poTanggal')) {
        document.getElementById('poTanggal').value = today;
    }

    const savedUser = localStorage.getItem('po_user');
    const loginDate = localStorage.getItem('po_login_date');

    if (savedUser && loginDate === today) {
        tampilkanFormPO();
    } else {
        localStorage.clear();
        tampilkanLogin();
    }

    initRobotAnimation();
};

function tampilkanLogin() {
    const loginSec = document.getElementById('loginSection');
    const poSec = document.getElementById('poSection');
    if (loginSec) loginSec.classList.remove('hidden');
    if (poSec) poSec.classList.add('hidden');
}

function tampilkanFormPO() {
    const loginSec = document.getElementById('loginSection');
    const poSec = document.getElementById('poSection');
    if (loginSec) loginSec.classList.add('hidden');
    if (poSec) poSec.classList.remove('hidden');
    loadMasterBarang();
}

async function handleLogin() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    const errDiv = document.getElementById('loginError');

    if (!user || !pass) {
        errDiv.innerText = "Username dan password wajib diisi!";
        return;
    }

    errDiv.innerText = "Memverifikasi...";

    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'login', username: user, password: pass })
        });
        const result = await response.json();

        if (result.status === 'success') {
            const today = getLocalDateString();
            localStorage.setItem('po_user', user);
            localStorage.setItem('po_login_date', today);
            tampilkanFormPO();
        } else {
            errDiv.innerText = result.message;
        }
    } catch (err) {
        errDiv.innerText = "Gagal terhubung ke server Apps Script!";
        console.error(err);
    }
}

async function loadMasterBarang() {
    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'getBarang' })
        });
        const result = await response.json();
        if (result.status === 'success') {
            masterBarang = result.data;
        }
    } catch (error) {
        console.error("Gagal mengambil data dari Google Sheets:", error);
    }
}

const triggerModal = document.getElementById('triggerModal');
const popupSearch = document.getElementById('popupSearch');
const searchInput = document.getElementById('searchInputPopup');
const itemList = document.getElementById('itemListPopup');
const btnCloseModal = document.getElementById('btnCloseModal');
const btnToggleScanner = document.getElementById('btnToggleScanner');

if (triggerModal) {
    triggerModal.addEventListener('click', function() {
        popupSearch.style.display = 'flex';
        searchInput.value = '';
        renderList(masterBarang);
        searchInput.focus();
    });
}

if (btnCloseModal) {
    btnCloseModal.addEventListener('click', function() {
        popupSearch.style.display = 'none';
        searchInput.value = '';
        renderList(masterBarang);
        stopCameraScanner();
    });
}

if (popupSearch) {
    popupSearch.addEventListener('click', function(e) {
        if (e.target === popupSearch) {
            popupSearch.style.display = 'none';
            stopCameraScanner();
        }
    });
}

if (btnToggleScanner) {
    btnToggleScanner.addEventListener('click', function() {
        if (!isScannerActive) {
            startCameraScanner();
        } else {
            stopCameraScanner();
        }
    });
}

function startCameraScanner() {
    const readerDiv = document.getElementById('reader');
    if (!readerDiv) return;
    
    readerDiv.style.display = 'block';
    btnToggleScanner.textContent = "Tutup Kamera Scanner";
    btnToggleScanner.style.background = "#dc3545";
    isScannerActive = true;

    if (!html5QrCode) {
        html5QrCode = new Html5Qrcode("reader");
    }

    html5QrCode.start(
        { facingMode: "environment" },
        {
            fps: 10,
            qrbox: { width: 250, height: 150 }
        },
        (decodedText, decodedResult) => {
            const scannedCode = decodedText.trim().toLowerCase();
            const matchedItem = masterBarang.find(item => {
                const kodeItem = (item.kode_barang || item.kode || '').toLowerCase();
                return kodeItem === scannedCode || kodeItem.includes(scannedCode);
            });

            if (matchedItem) {
                stopCameraScanner();
                pilihBarang(matchedItem);
            } else {
                alert(`Barcode "${decodedText}" tidak ditemukan di database Master Barang!`);
            }
        },
        (errorMessage) => {}
    ).catch(err => {
        console.error("Gagal membuka kamera:", err);
        alert("Gagal mengakses kamera HP. Pastikan izin kamera diizinkan.");
        stopCameraScanner();
    });
}

function stopCameraScanner() {
    if (html5QrCode && isScannerActive) {
        html5QrCode.stop().then(() => {
            isScannerActive = false;
            const readerDiv = document.getElementById('reader');
            if (readerDiv) readerDiv.style.display = 'none';
            if (btnToggleScanner) {
                btnToggleScanner.textContent = "📷 Buka Kamera Scanner";
                btnToggleScanner.style.background = "#28a745";
            }
        }).catch(err => {
            console.error("Gagal menghentikan kamera:", err);
        });
    } else {
        isScannerActive = false;
        const readerDiv = document.getElementById('reader');
        if (readerDiv) readerDiv.style.display = 'none';
        if (btnToggleScanner) {
            btnToggleScanner.textContent = "📷 Buka Kamera Scanner";
            btnToggleScanner.style.background = "#28a745";
        }
    }
}

function pilihBarang(item) {
    selectedItemData = item;
    const namaVal = item.nama_barang || item.nama || '';
    const kodeVal = item.kode_barang || item.kode || '';
    const picVal = item.pic || '';

    if (triggerModal) triggerModal.textContent = namaVal;
    
    if (document.getElementById('poKode')) document.getElementById('poKode').value = kodeVal;
    if (document.getElementById('poNama')) document.getElementById('poNama').value = namaVal;
    if (document.getElementById('poPic')) document.getElementById('poPic').value = picVal;

    stopCameraScanner();
    popupSearch.style.display = 'none';
    if (searchInput) searchInput.value = '';
}

if (searchInput) {
    searchInput.addEventListener('input', function() {
        const keyword = this.value.toLowerCase().trim();
        const filtered = masterBarang.filter(item => {
            const namaItem = item.nama_barang || item.nama || '';
            const kodeItem = item.kode_barang || item.kode || '';
            return namaItem.toLowerCase().includes(keyword) || kodeItem.toLowerCase().includes(keyword);
        });
        renderList(filtered);
    });
}

function renderList(data) {
    if (!itemList) return;
    itemList.innerHTML = '';
    if (data.length === 0) {
        itemList.innerHTML = `<div style="padding: 15px; color: #000000; text-align: center; font-size: 14px; font-weight: bold;">Barang tidak ditemukan</div>`;
        return;
    }

    data.forEach(item => {
        const namaItem = item.nama_barang || item.nama || 'Tanpa Nama';
        const kodeItem = item.kode_barang || item.kode || '';
        
        const div = document.createElement('div');
        div.className = 'item-pilihan';
        div.innerHTML = `
            <span class="item-kode">[${kodeItem}]</span>
            <span class="item-nama">${namaItem}</span>
        `;
        
        div.addEventListener('click', function() {
            pilihBarang(item);
        });

        itemList.appendChild(div);
    });
}

async function submitPO(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSubmit');
    const msg = document.getElementById('poMessage');
    btn.innerText = "Mengirim...";
    btn.disabled = true;

    const dataPO = {
        action: 'submitPO',
        tanggal: document.getElementById('poTanggal').value,
        kodeBarang: document.getElementById('poKode').value,
        namaBarang: document.getElementById('poNama').value,
        pic: document.getElementById('poPic').value,
        jumlah: document.getElementById('poJumlah').value
    };

    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify(dataPO)
        });
        const result = await response.json();
        if (result.status === 'success') {
            msg.innerText = "Data PO berhasil dikirim ke Google Sheet!";
            document.getElementById('poForm').reset();
            document.getElementById('poTanggal').value = getLocalDateString();
            document.getElementById('poKode').value = '';
            document.getElementById('poNama').value = '';
            document.getElementById('poPic').value = '';
            if (triggerModal) triggerModal.textContent = "-- Pilih Barang dari Master --";
            setTimeout(() => msg.innerText = "", 4000);
        } else {
            alert("Gagal menyimpan: " + result.message);
        }
    } catch (err) {
        alert("Terjadi kesalahan koneksi saat kirim PO!");
        console.error(err);
    } finally {
        btn.innerText = "Kirim PO";
        btn.disabled = false;
    }
}

function initRobotAnimation() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const robotContainer = document.getElementById('robotContainer');
    const robotBubble = document.getElementById('robotBubble');

    if (usernameInput && passwordInput && robotContainer && robotBubble) {
        usernameInput.addEventListener('focus', function() {
            robotContainer.classList.remove('password-active');
            robotBubble.textContent = "Halo! Masukkan username kamu ya 👤";
        });

        passwordInput.addEventListener('focus', function() {
            robotContainer.classList.add('password-active');
            robotBubble.textContent = "Waduh, password rahasia! Aku tutup mata ya 🙈";
        });

        usernameInput.addEventListener('blur', function() {
            setTimeout(() => {
                if (document.activeElement !== passwordInput && document.activeElement !== usernameInput) {
                    robotContainer.classList.remove('password-active');
                    robotBubble.textContent = "Masukkan akun internal gudang";
                }
            }, 100);
        });

        passwordInput.addEventListener('blur', function() {
            setTimeout(() => {
                if (document.activeElement !== passwordInput && document.activeElement !== usernameInput) {
                    robotContainer.classList.remove('password-active');
                    robotBubble.textContent = "Masukkan akun internal gudang";
                }
            }, 100);
        });
    }
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    
    if (!passwordInput || !togglePassword) return;

    const eyeOpenSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    const eyeClosedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12c3 5 7 7 10 7s7-2 10-7"></path></svg>`;

    const isPassword = passwordInput.getAttribute('type') === 'password';
    
    if (isPassword) {
        passwordInput.setAttribute('type', 'text');
        togglePassword.innerHTML = eyeOpenSvg;
    } else {
        passwordInput.setAttribute('type', 'password');
        togglePassword.innerHTML = eyeClosedSvg;
    }
}

function handleLogout() {
    localStorage.clear();
    tampilkanLogin();
}