const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxte5kTB8H88pQ2DKUp4CE0mrnu_3egJhvfApOuERvUOrLKKGrumrf0IVvhRlCpEJktNQ/exec";

let masterBarang = [];
let selectedItemData = null;
let html5QrCode = null;
let isScannerActive = false;

// Cek sesi login & aturan wajib login sehari sekali setiap halaman dibuka
window.onload = function() {
    if (document.getElementById('poTanggal')) {
        document.getElementById('poTanggal').valueAsDate = new Date();
    }

    const savedUser = localStorage.getItem('po_user');
    const loginDate = localStorage.getItem('po_login_date');
    const today = new Date().toISOString().split('T')[0];

    if (savedUser && loginDate === today) {
        tampilkanFormPO();
    } else {
        localStorage.clear();
        tampilkanLogin();
    }
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
            const today = new Date().toISOString().split('T')[0];
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

// Ambil data master barang dari Google Sheets
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

// Inisialisasi elemen Pop-up Search & Kamera
const triggerModal = document.getElementById('triggerModal');
const popupSearch = document.getElementById('popupSearch');
const searchInput = document.getElementById('searchInputPopup');
const itemList = document.getElementById('itemListPopup');
const clearBtn = document.getElementById('clearInputBtn');
const btnToggleScanner = document.getElementById('btnToggleScanner');

if (triggerModal) {
    triggerModal.addEventListener('click', function() {
        popupSearch.style.display = 'flex';
        searchInput.value = '';
        renderList(masterBarang);
        searchInput.focus();
    });
}

if (clearBtn) {
    clearBtn.addEventListener('click', function() {
        searchInput.value = '';
        renderList(masterBarang);
        stopCameraScanner();
        searchInput.focus();
    });
}

// Tombol untuk Buka/Tutup Kamera Scanner HP
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
    btnToggleScanner.style.background = "#dc3545"; // Warna merah saat kamera aktif
    isScannerActive = true;

    if (!html5QrCode) {
        html5QrCode = new Html5Qrcode("reader");
    }

    // Mulai kamera menghadap belakang (environment)
    html5QrCode.start(
        { facingMode: "environment" },
        {
            fps: 10,
            qrbox: { width: 250, height: 150 }
        },
        (decodedText, decodedResult) => {
            console.log(`Scan result: ${decodedText}`, decodedResult);
            
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
        (errorMessage) => {
            // Frame scan gagal dideteksi (diabaikan)
        }
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
                btnToggleScanner.style.background = "#28a745"; // Kembalikan ke hijau
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

// Fungsi pilih barang dan langsung masukkan ke form PO
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

// Filter pencarian teks biasa lewat keyboard
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

// Render daftar barang dengan warna teks kontras & rapi
function renderList(data) {
    if (!itemList) return;
    itemList.innerHTML = '';
    if (data.length === 0) {
        itemList.innerHTML = `<div style="padding: 15px; color: #777; text-align: center; font-size: 14px;">Barang tidak ditemukan</div>`;
        return;
    }

    data.forEach(item => {
        const namaItem = item.nama_barang || item.nama || 'Tanpa Nama';
        const kodeItem = item.kode_barang || item.kode || '';
        const div = document.createElement('div');
        div.className = 'item-pilihan';
        div.style.padding = "12px 10px";
        div.style.borderBottom = "1px solid #e0e0e0";
        div.style.cursor = "pointer";
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; pointer-events: none;">
                <span style="font-weight: bold; color: #007BFF; font-size: 13px;">[${kodeItem}]</span>
                <span style="color: #333; text-align: right; flex: 1; margin-left: 12px; font-size: 13px; font-weight: 500;">${namaItem}</span>
            </div>
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
            document.getElementById('poTanggal').valueAsDate = new Date();
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

function handleLogout() {
    localStorage.clear();
    tampilkanLogin();
}