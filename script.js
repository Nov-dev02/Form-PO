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

<<<<<<< HEAD
// Fungsi Jam Real-Time yang otomatis update setiap detik
function updateRealTimeClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;
    
    document.querySelectorAll('.real-time-clock').forEach(el => {
        el.textContent = timeString;
    });
}
setInterval(updateRealTimeClock, 1000);

// Fungsi Sapaan Dinamis dengan Kata Motivasi yang Berubah-ubah (Acak) Sesuai Waktu & Refresh
function setDynamicGreeting(username) {
    const greetingEl = document.getElementById('userGreeting');
    if (!greetingEl) return;
    
    const now = new Date();
    const hour = now.getHours();
    let waktu = "Malam";
    let daftarMotivasi = [];
    
    if (hour >= 4 && hour < 11) {
        waktu = "Pagi";
        daftarMotivasi = [
            "Awali hari dengan semangat baru dan catat inventaris dengan teliti!",
            "Pagi yang cerah, semoga stok barang hari ini aman terkendali!",
            "Semangat pagi! Jangan lupa senyum dan pastikan data PO akurat."
        ];
    } else if (hour >= 11 && hour < 15) {
        waktu = "Siang";
        daftarMotivasi = [
            "Tetap fokus dan jaga produktivitas kerja di siang hari ini!",
            "Udah jam siang, tetap semangat selesaikan tugas gudangnya ya!",
            "Meskipun gerah di siang hari, pastikan input data tetap presisi!"
        ];
    } else if (hour >= 15 && hour < 18) {
        waktu = "Sore";
        daftarMotivasi = [
            "Sebentar lagi jam pulang, selesaikan rekap PO dengan cermat ya!",
            "Sore-sore gini tetap gaspol, rapikan sisa laporan gudang!",
            "Hampir jam pulang, cek sekali lagi data barang masuknya biar pas."
        ];
    } else {
        waktu = "Malam";
        daftarMotivasi = [
            "Kerja hebat! Pastikan semua data PO tercatat dengan akurat.",
            "Lembur malam tetap produktif, jaga kesehatan ya bro!",
            "Malam tenang, waktunya beresin tugas terakhir dengan teliti."
        ];
    }
    
    // Mengambil kalimat motivasi secara acak setiap kali halaman direfresh / dibuka
    const motivasiAcak = daftarMotivasi[Math.floor(Math.random() * daftarMotivasi.length)];
    
    greetingEl.innerHTML = `Selamat ${waktu}, <b>${username}</b>! <br><span style="font-size: 11px; color: #94a3b8;">${motivasiAcak}</span>`;
}

window.onload = function() {
    updateRealTimeClock();
=======
window.onload = function() {
>>>>>>> 535fbaa094cbe54c6a3bb10095628a679faadbf6
    const today = getLocalDateString();
    const poTanggal = document.getElementById('poTanggal');
    if (poTanggal) poTanggal.value = today;

    const savedUser = localStorage.getItem('po_user');
    const loginDate = localStorage.getItem('po_login_date');

    if (savedUser && loginDate === today) {
        tampilkanFormPO(savedUser);
    } else {
        localStorage.clear();
        tampilkanLogin();
    }

    initRobotAnimation();
    initEventListeners();
};

function tampilkanLogin() {
    const loginSec = document.getElementById('loginSection');
    const poSec = document.getElementById('poSection');
    if (loginSec) loginSec.classList.remove('hidden');
    if (poSec) poSec.classList.add('hidden');
}

function tampilkanFormPO(username) {
    const loginSec = document.getElementById('loginSection');
    const poSec = document.getElementById('poSection');
    if (loginSec) loginSec.classList.add('hidden');
    if (poSec) poSec.classList.remove('hidden');
    
    setDynamicGreeting(username);
    loadMasterBarang();
}

async function handleLogin() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errDiv = document.getElementById('loginError');
    const btnLogin = document.getElementById('btnLogin');

    const user = usernameInput ? usernameInput.value.trim() : '';
    const pass = passwordInput ? passwordInput.value.trim() : '';

    if (!user || !pass) {
        if (errDiv) errDiv.innerText = "Username dan password wajib diisi!";
        return;
    }

<<<<<<< HEAD
=======
    // Kosongkan pesan error sebelumnya & matikan tombol
>>>>>>> 535fbaa094cbe54c6a3bb10095628a679faadbf6
    if (errDiv) errDiv.innerText = "";
    if (btnLogin) {
        btnLogin.disabled = true;
        btnLogin.style.opacity = "0.7";
    }
<<<<<<< HEAD

    const spinner = `<span class="spinner"></span>`;
    const dots = `<span class="dots"></span>`;
=======
>>>>>>> 535fbaa094cbe54c6a3bb10095628a679faadbf6

    const spinner = `<span class="spinner"></span>`;
    const dots = `<span class="dots"></span>`;

    // Tahapan loading dengan spinner muter & titik-titik bergerak dinamis
    try {
        if (btnLogin) btnLogin.innerHTML = `${spinner} Verifikasi akun${dots}`;
<<<<<<< HEAD
        await new Promise(resolve => setTimeout(resolve, 800));

        if (btnLogin) btnLogin.innerHTML = `${spinner} Menghubungkan ke server${dots}`;
        
=======
        await new Promise(resolve => setTimeout(resolve, 800)); // Jeda sejenak

        if (btnLogin) btnLogin.innerHTML = `${spinner} Menghubungkan ke server${dots}`;
        
        // Eksekusi fetch ke Google Apps Script
>>>>>>> 535fbaa094cbe54c6a3bb10095628a679faadbf6
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'login', username: user, password: pass })
        });
        const result = await response.json();

        if (result.status === 'success') {
            if (btnLogin) btnLogin.innerHTML = `🚀 Akses diterima! Membuka sistem${dots}`;
<<<<<<< HEAD
            await new Promise(resolve => setTimeout(resolve, 700));
=======
            await new Promise(resolve => setTimeout(resolve, 700)); // Jeda sebentar sebelum masuk
>>>>>>> 535fbaa094cbe54c6a3bb10095628a679faadbf6

            const today = getLocalDateString();
            localStorage.setItem('po_user', user);
            localStorage.setItem('po_login_date', today);
            
<<<<<<< HEAD
=======
            // Reset tombol sebelum masuk form
>>>>>>> 535fbaa094cbe54c6a3bb10095628a679faadbf6
            if (btnLogin) {
                btnLogin.innerHTML = "Masuk";
                btnLogin.disabled = false;
                btnLogin.style.opacity = "1";
            }
<<<<<<< HEAD
            tampilkanFormPO(user);
        } else {
=======
            tampilkanFormPO();
        } else {
            // Kalau gagal dari server
>>>>>>> 535fbaa094cbe54c6a3bb10095628a679faadbf6
            if (btnLogin) {
                btnLogin.innerHTML = "Masuk";
                btnLogin.disabled = false;
                btnLogin.style.opacity = "1";
            }
            if (errDiv) errDiv.innerText = result.message || "Username atau password salah!";
        }
    } catch (err) {
<<<<<<< HEAD
=======
        // Kalau error koneksi / jaringan
>>>>>>> 535fbaa094cbe54c6a3bb10095628a679faadbf6
        if (btnLogin) {
            btnLogin.innerHTML = "Masuk";
            btnLogin.disabled = false;
            btnLogin.style.opacity = "1";
        }
        if (errDiv) errDiv.innerText = "Gagal terhubung ke server Apps Script!";
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
<<<<<<< HEAD
        } else {
            console.warn("Gagal load master barang:", result.message);
=======
            console.log("Data Master Barang Berhasil Dimuat:", masterBarang);
        } else {
            console.warn("Gagal load master barang dari server:", result.message);
>>>>>>> 535fbaa094cbe54c6a3bb10095628a679faadbf6
        }
    } catch (error) {
        console.error("Gagal mengambil data dari Google Sheets:", error);
    }
}

function initEventListeners() {
    const triggerModal = document.getElementById('triggerModal');
    const popupSearch = document.getElementById('popupSearch');
    const searchInput = document.getElementById('searchInputPopup');
    const btnCloseModal = document.getElementById('btnCloseModal');
    const btnToggleScanner = document.getElementById('btnToggleScanner');

    if (triggerModal) {
        triggerModal.addEventListener('click', function() {
            if (popupSearch) popupSearch.style.display = 'flex';
            if (searchInput) searchInput.value = '';
            renderList(masterBarang);
            if (searchInput) searchInput.focus();
        });
    }

    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', function() {
            if (popupSearch) popupSearch.style.display = 'none';
            if (searchInput) searchInput.value = '';
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
}

async function startCameraScanner() {
    const readerDiv = document.getElementById('reader');
    const btnToggleScanner = document.getElementById('btnToggleScanner');
    if (!readerDiv) return;

    if (masterBarang.length === 0) {
        if (btnToggleScanner) btnToggleScanner.textContent = "Memuat Database...";
        await loadMasterBarang();
        if (masterBarang.length === 0) {
<<<<<<< HEAD
            alert("Database Master Barang kosong atau gagal dimuat!");
=======
            alert("Database Master Barang kosong atau gagal dimuat! Periksa koneksi internet Anda.");
>>>>>>> 535fbaa094cbe54c6a3bb10095628a679faadbf6
            if (btnToggleScanner) btnToggleScanner.textContent = "📷 Buka Kamera Scanner";
            return;
        }
    }
    
    readerDiv.style.display = 'block';
    if (btnToggleScanner) {
        btnToggleScanner.textContent = "Tutup Kamera Scanner";
        btnToggleScanner.style.background = "#dc3545";
    }
    isScannerActive = true;

    if (!html5QrCode) {
        html5QrCode = new Html5Qrcode("reader");
    }

    html5QrCode.start(
        { facingMode: "environment" },
        {
            fps: 35,
            qrbox: { width: 220, height: 220 },
            formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ],
            videoConstraints: {
                facingMode: "environment",
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            }
        },
        (decodedText) => {
            const scannedCode = decodedText.trim().toLowerCase();
            console.log("QR Code Terbaca:", scannedCode);

            const matchedItem = masterBarang.find(item => {
                const kodeItem = (item.kode_barang || item.kode || item.kodeBarang || item.code || '').trim().toLowerCase();
                return kodeItem === scannedCode || kodeItem.includes(scannedCode) || scannedCode.includes(kodeItem);
            });

            if (matchedItem) {
                stopCameraScanner();
                pilihBarang(matchedItem);
            } else {
                alert(`Barcode "${decodedText}" tidak ditemukan di database Master Barang!`);
            }
        },
        () => {}
    ).catch(err => {
        console.error("Gagal membuka kamera:", err);
        alert("Gagal mengakses kamera HP.");
        stopCameraScanner();
    });
}

function stopCameraScanner() {
    const btnToggleScanner = document.getElementById('btnToggleScanner');
    const readerDiv = document.getElementById('reader');

    if (html5QrCode && isScannerActive) {
        html5QrCode.stop().then(() => {
            isScannerActive = false;
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

    const triggerModalEl = document.getElementById('triggerModal');
    if (triggerModalEl) triggerModalEl.textContent = namaVal;
    
    const poKodeEl = document.getElementById('poKode');
    if (poKodeEl) poKodeEl.value = kodeVal;
    const poNamaEl = document.getElementById('poNama');
    if (poNamaEl) poNamaEl.value = namaVal;
    const poPicEl = document.getElementById('poPic');
    if (poPicEl) poPicEl.value = picVal;

    stopCameraScanner();
<<<<<<< HEAD
    if (document.getElementById('popupSearch')) document.getElementById('popupSearch').style.display = 'none';
    if (document.getElementById('searchInputPopup')) document.getElementById('searchInputPopup').value = '';
=======
    const popupSearch = document.getElementById('popupSearch');
    if (popupSearch) popupSearch.style.display = 'none';
    const searchInput = document.getElementById('searchInputPopup');
    if (searchInput) searchInput.value = '';
>>>>>>> 535fbaa094cbe54c6a3bb10095628a679faadbf6
}

function renderList(data) {
    const itemList = document.getElementById('itemListPopup');
    if (!itemList) return;
    itemList.innerHTML = '';
    if (data.length === 0) {
        itemList.innerHTML = `<div style="padding: 15px; color: #94a3b8; text-align: center; font-size: 14px;">Barang tidak ditemukan</div>`;
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
    if (e) e.preventDefault();
    const btn = document.getElementById('btnSubmit');
    const msg = document.getElementById('poMessage');
    
    const spinner = `<span class="spinner"></span>`;
    const dots = `<span class="dots"></span>`;

    if (btn) {
        btn.disabled = true;
        btn.style.opacity = "0.7";
        btn.innerHTML = `${spinner} Mengirim PO${dots}`;
    }

    const dataPO = {
        action: 'submitPO',
        tanggal: document.getElementById('poTanggal') ? document.getElementById('poTanggal').value : '',
        kodeBarang: document.getElementById('poKode') ? document.getElementById('poKode').value : '',
        namaBarang: document.getElementById('poNama') ? document.getElementById('poNama').value : '',
        pic: document.getElementById('poPic') ? document.getElementById('poPic').value : '',
        jumlah: document.getElementById('poJumlah') ? document.getElementById('poJumlah').value : ''
    };

    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify(dataPO)
        });
        const result = await response.json();
        if (result.status === 'success') {
            if (btn) btn.innerHTML = `✅ Berhasil Dikirim!`;
            await new Promise(resolve => setTimeout(resolve, 800));

            if (msg) msg.innerText = "Data PO berhasil dikirim ke Google Sheet!";
<<<<<<< HEAD
            if (document.getElementById('poForm')) document.getElementById('poForm').reset();
            
            if (document.getElementById('poTanggal')) document.getElementById('poTanggal').value = getLocalDateString();
            if (document.getElementById('poKode')) document.getElementById('poKode').value = '';
            if (document.getElementById('poNama')) document.getElementById('poNama').value = '';
            if (document.getElementById('poPic')) document.getElementById('poPic').value = '';
            if (document.getElementById('triggerModal')) document.getElementById('triggerModal').textContent = "-- Pilih Barang dari Master --";
=======
            const poForm = document.getElementById('poForm');
            if (poForm) poForm.reset();
            
            const poTanggal = document.getElementById('poTanggal');
            if (poTanggal) poTanggal.value = getLocalDateString();
            
            if (document.getElementById('poKode')) document.getElementById('poKode').value = '';
            if (document.getElementById('poNama')) document.getElementById('poNama').value = '';
            if (document.getElementById('poPic')) document.getElementById('poPic').value = '';
            const triggerModal = document.getElementById('triggerModal');
            if (triggerModal) triggerModal.textContent = "-- Pilih Barang dari Master --";
>>>>>>> 535fbaa094cbe54c6a3bb10095628a679faadbf6
            
            setTimeout(() => { if (msg) msg.innerText = ""; }, 4000);
        } else {
            alert("Gagal menyimpan: " + result.message);
        }
    } catch (err) {
        alert("Terjadi kesalahan koneksi saat kirim PO!");
        console.error(err);
    } finally {
        if (btn) {
            btn.innerHTML = "Kirim PO";
            btn.disabled = false;
            btn.style.opacity = "1";
        }
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