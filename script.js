const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwMxaPzNaYATNn-zMyx36NvjYQ1iwjwKYbmpezRMxE_OYWUd-JveOUbFGVMApS1ZZDdvw/exec";

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

// Fungsi Jam Real-Time
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

// Fungsi Sapaan Dinamis
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
    
    const motivasiAcak = daftarMotivasi[Math.floor(Math.random() * daftarMotivasi.length)];
    greetingEl.innerHTML = `Selamat ${waktu}, <b>${username}</b>! <br><span style="font-size: 11px; color: #94a3b8;">${motivasiAcak}</span>`;
}

window.onload = function() {
    updateRealTimeClock();
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

    if (errDiv) errDiv.innerText = "";
    if (btnLogin) {
        btnLogin.disabled = true;
        btnLogin.style.opacity = "0.7";
    }

    const spinner = `<span class="spinner"></span>`;
    const dots = `<span class="dots"></span>`;

    try {
        if (btnLogin) btnLogin.innerHTML = `${spinner} Menghubungkan ke server${dots}`;
        
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'login',
                username: user,
                password: pass
            })
        });
        const result = await response.json();

        if (result.status === 'success') {
            if (btnLogin) btnLogin.innerHTML = `🚀 Akses diterima! Membuka sistem${dots}`;
            await new Promise(resolve => setTimeout(resolve, 700));

            const today = getLocalDateString();
            localStorage.setItem('po_user', user);
            localStorage.setItem('po_login_date', today);
            
            if (btnLogin) {
                btnLogin.innerHTML = "Masuk";
                btnLogin.disabled = false;
                btnLogin.style.opacity = "1";
            }
            tampilkanFormPO(user);
        } else {
            if (btnLogin) {
                btnLogin.innerHTML = "Masuk";
                btnLogin.disabled = false;
                btnLogin.style.opacity = "1";
            }
            if (errDiv) errDiv.innerText = result.message || "Username atau password salah!";
        }
    } catch (err) {
        if (btnLogin) {
            btnLogin.innerHTML = "Masuk";
            btnLogin.disabled = false;
            btnLogin.style.opacity = "1";
        }
        if (errDiv) errDiv.innerText = "Gagal terhubung ke server Apps Script!";
        console.error(err);
    }
}

// Fungsi Load Master Barang dari Google Sheets
async function loadMasterBarang() {
    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'getBarang' })
        });
        const result = await response.json();
        if (result.status === 'success') {
            masterBarang = result.data;
            console.log("Master barang berhasil dimuat:", masterBarang.length, "item");
        } else {
            console.warn("Gagal load master barang:", result.message);
        }
    } catch (error) {
        console.error("Gagal mengambil data dari Google Sheets:", error);
    }
}

// Render daftar barang ke dalam modal pop-up
function renderList(data) {
    const container = document.getElementById('itemListPopup');
    if (!container) return;

    if (!data || data.length === 0) {
        container.innerHTML = `<div style="padding: 15px; text-align: center; color: #94a3b8; font-size: 13px;">Tidak ada barang ditemukan</div>`;
        return;
    }

    container.innerHTML = data.map(item => {
        const kode = item.kode_barang || item.kode || '-';
        const nama = item.nama_barang || item.nama || '-';
        const pic = item.pic || '-';
        return `
            <div class="item-pilihan" onclick="pilihBarang('${kode}', '${nama}', '${pic}')">
                <span class="item-kode">${kode}</span>
                <span class="item-nama">${nama} (${pic})</span>
            </div>
        `;
    }).join('');
}

function pilihBarang(kode, nama, pic) {
    document.getElementById('poKode').value = kode;
    document.getElementById('poNama').value = nama;
    document.getElementById('poPic').value = pic;
    document.getElementById('triggerModal').textContent = `${kode} - ${nama}`;
    document.getElementById('popupSearch').style.display = 'none';
    stopCameraScanner();

    // 🚀 TAMBAHAN: Auto-scroll halus ke bawah (area jumlah / tombol kirim)
    setTimeout(() => {
        const submitBtn = document.querySelector('#poSection button[type="submit"]');
        if (submitBtn) {
            submitBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 150);
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

// Fungsi Standalone Tombol Kamera (Aman dari error scan ongoing)
async function startCameraScanner() {
    const readerDiv = document.getElementById('reader');
    const btnToggleScanner = document.getElementById('btnToggleScanner');
    const titleScanner = document.getElementById('scannerTextTitle');
    if (!readerDiv) return;

    readerDiv.style.display = 'block';
    if (titleScanner) titleScanner.textContent = "🔴 Tutup Scanner";
    if (btnToggleScanner) btnToggleScanner.style.borderColor = '#f59e0b';
    isScannerActive = true;

    if (!html5QrCode) {
        html5QrCode = new Html5Qrcode("reader");
    }

    try {
        if (html5QrCode.isScanning) {
            await html5QrCode.stop();
        }

        await html5QrCode.start(
            { facingMode: "environment" },
            {
                fps: 10,
                qrbox: { width: 250, height: 250 }
            },
            onScanSuccess, 
            onScanFailure
        );
    } catch (err) {
        console.error("Gagal membuka kamera:", err);
        alert("Tidak dapat mengakses kamera: " + (err.message || err));
        readerDiv.style.display = 'none';
        if (titleScanner) titleScanner.textContent = "Scan QR";
        if (btnToggleScanner) btnToggleScanner.style.borderColor = '#10b981';
        isScannerActive = false;
    }
}

// Fungsi Stop Kamera (Aman)
async function stopCameraScanner() {
    const readerDiv = document.getElementById('reader');
    const btnToggleScanner = document.getElementById('btnToggleScanner');
    const titleScanner = document.getElementById('scannerTextTitle');

    if (html5QrCode) {
        try {
            if (html5QrCode.isScanning) {
                await html5QrCode.stop();
            }
        } catch (err) {
            console.log("Gagal stop scanner:", err);
        }
    }

    if (readerDiv) readerDiv.style.display = 'none';
    if (titleScanner) titleScanner.textContent = "Scan QR";
    if (btnToggleScanner) btnToggleScanner.style.borderColor = '#10b981';
    isScannerActive = false;
}

// Callback ketika Barcode/QR berhasil dibaca
function onScanSuccess(decodedText, decodedResult) {
    console.log(`Scan berhasil: ${decodedText}`);
    
    const found = masterBarang.find(item => {
        const kode = (item.kode_barang || item.kode || '').toString().trim().toLowerCase();
        const nama = (item.nama_barang || item.nama || '').toString().trim().toLowerCase();
        const scan = decodedText.trim().toLowerCase();
        return kode === scan || nama.includes(scan);
    });

    if (found) {
        const kode = found.kode_barang || found.kode || '';
        const nama = found.nama_barang || found.nama || '';
        const pic = found.pic || '';
        
        // Memanggil pilihBarang agar form terisi, modal tertutup, dan otomatis auto-scroll
        pilihBarang(kode, nama, pic);
        
        alert(`Berhasil memilih barang: ${nama}`);
    } else {
        document.getElementById('poKode').value = decodedText;
        document.getElementById('triggerModal').textContent = decodedText;
        stopCameraScanner();
        alert(`Kode terdeteksi: ${decodedText} (Tidak ada di master barang, kode dimasukkan manual)`);

        // 🚀 TAMBAHAN: Auto-scroll juga untuk kode manual hasil scan
        setTimeout(() => {
            const submitBtn = document.querySelector('#poSection button[type="submit"]');
            if (submitBtn) {
                submitBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 150);
    }
}

function onScanFailure(error) {
    // Diabaikan agar tidak spam console log
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
        await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(dataPO)
        });

        if (btn) btn.innerHTML = `✅ Berhasil Dikirim!`;
        await new Promise(resolve => setTimeout(resolve, 600));

        if (msg) msg.innerText = "Data PO Berhasil Disimpan di Google Sheets!";
        if (document.getElementById('poForm')) document.getElementById('poForm').reset();
        
        if (document.getElementById('poTanggal')) document.getElementById('poTanggal').value = getLocalDateString();
        if (document.getElementById('poKode')) document.getElementById('poKode').value = '';
        if (document.getElementById('poNama')) document.getElementById('poNama').value = '';
        if (document.getElementById('poPic')) document.getElementById('poPic').value = '';
        if (document.getElementById('triggerModal')) document.getElementById('triggerModal').textContent = "-- Pilih Barang dari Master --";
        
        setTimeout(() => { if (msg) msg.innerText = ""; }, 3000);

    } catch (err) {
        console.error("Gagal mengirim:", err);
        alert("Terjadi kendala koneksi internet!");
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

function tambahJumlah(angka) {
    let inputJumlah = document.getElementById('poJumlah');
    let nilaiSekarang = parseInt(inputJumlah.value) || 0;
    inputJumlah.value = nilaiSekarang + angka;
}