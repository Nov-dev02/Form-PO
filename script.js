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

// Injeksi Styling Tombol & Spinner Modern secara Otomatis
function injectModernStyles() {
    if (document.getElementById('modernCustomStyles')) return;
    const style = document.createElement('style');
    style.id = 'modernCustomStyles';
    style.innerHTML = `
        #btnLogin, #btnSubmit {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
            border: none !important;
            border-radius: 8px !important;
            font-weight: 600 !important;
            letter-spacing: 0.5px !important;
            transition: all 0.3s ease !important;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3) !important;
        }
        #btnLogin:hover:not(:disabled), #btnSubmit:hover:not(:disabled) {
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%) !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4) !important;
        }
        #btnLogin:active:not(:disabled), #btnSubmit:active:not(:disabled) {
            transform: translateY(0) !important;
        }
        .modern-spinner {
            display: inline-block;
            width: 14px;
            height: 14px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: #ffffff;
            border-radius: 50%;
            animation: spinBtn 0.8s linear infinite;
            vertical-align: middle;
            margin-right: 8px;
        }
        @keyframes spinBtn {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
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
    injectModernStyles();
    
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
    checkFormValidity();
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
        if (errDiv) {
            errDiv.style.color = "#ef4444";
            errDiv.innerText = "Username dan password wajib diisi!";
        }
        return;
    }

    if (errDiv) errDiv.innerText = "";
    if (btnLogin) {
        btnLogin.disabled = true;
        btnLogin.style.opacity = "0.7";
    }

    try {
        if (btnLogin) btnLogin.innerHTML = `<span class="modern-spinner"></span>Memproses...`;
        if (errDiv) {
            errDiv.style.color = "#38bdf8";
            errDiv.innerText = "Menghubungkan ke server...";
        }
        
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
            if (errDiv) {
                errDiv.style.color = "#10b981";
                errDiv.innerText = "Akses diterima! Membuka sistem...";
            }
            await new Promise(resolve => setTimeout(resolve, 600));

            const today = getLocalDateString();
            localStorage.setItem('po_user', user);
            localStorage.setItem('po_login_date', today);
            
            if (btnLogin) {
                btnLogin.innerHTML = "Masuk";
                btnLogin.disabled = false;
                btnLogin.style.opacity = "1";
            }
            if (errDiv) errDiv.innerText = "";
            tampilkanFormPO(user);
        } else {
            if (btnLogin) {
                btnLogin.innerHTML = "Masuk";
                btnLogin.disabled = false;
                btnLogin.style.opacity = "1";
            }
            if (errDiv) {
                errDiv.style.color = "#ef4444";
                errDiv.innerText = result.message || "Username atau password salah!";
            }
        }
    } catch (err) {
        if (btnLogin) {
            btnLogin.innerHTML = "Masuk";
            btnLogin.disabled = false;
            btnLogin.style.opacity = "1";
        }
        if (errDiv) {
            errDiv.style.color = "#ef4444";
            errDiv.innerText = "Gagal terhubung ke server Apps Script!";
        }
        console.error(err);
    }
}

// Fungsi Load Master Barang dari Google Sheets (Dibuat Lebih Tangguh)
async function loadMasterBarang() {
    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'getBarang' })
        });
        const result = await response.json();
        if (result.status === 'success' && Array.isArray(result.data)) {
            masterBarang = result.data;
            console.log("Master barang berhasil dimuat:", masterBarang.length, "item");
        } else {
            console.warn("Gagal load master barang / data kosong:", result);
        }
    } catch (error) {
        console.error("Gagal mengambil data dari Google Sheets:", error);
    }
}

// Render daftar barang ke dalam modal pop-up dengan Handler Aman
function renderList(data) {
    const container = document.getElementById('itemListPopup');
    if (!container) return;

    if (!data || data.length === 0) {
        container.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #94a3b8; font-size: 13px;">
                Tidak ada barang ditemukan atau data belum termuat.<br>
                <button onclick="muatUlangMasterBarangManual()" style="margin-top: 10px; padding: 6px 14px; background: #3b82f6; border: none; color: white; border-radius: 6px; cursor: pointer; font-weight: 600;">Muat Ulang Data</button>
            </div>`;
        return;
    }

    container.innerHTML = data.map(item => {
        let kode = '-', nama = '-', pic = '-';
        if (Array.isArray(item)) {
            kode = item[0] || '-';
            nama = item[1] || '-';
            pic = item[2] || '-';
        } else if (typeof item === 'object' && item !== null) {
            kode = item.kode_barang || item.kode || item.code || '-';
            nama = item.nama_barang || item.nama || item.name || '-';
            pic = item.pic || item.penanggung_jawab || '-';
        }
        return `
            <div class="item-pilihan" onclick="pilihBarang('${escapeHtml(kode)}', '${escapeHtml(nama)}', '${escapeHtml(pic)}')">
                <span class="item-kode">${kode}</span>
                <span class="item-nama">${nama} (${pic})</span>
            </div>
        `;
    }).join('');
}

function escapeHtml(text) {
    return String(text).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

async function muatUlangMasterBarangManual() {
    const container = document.getElementById('itemListPopup');
    if (container) {
        container.innerHTML = `<div style="padding: 20px; text-align: center; color: #38bdf8; font-size: 13px;"><span class="modern-spinner"></span> Sedang memuat data dari server...</div>`;
    }
    await loadMasterBarang();
    renderList(masterBarang);
}

function pilihBarang(kode, nama, pic) {
    document.getElementById('poKode').value = kode;
    document.getElementById('poNama').value = nama;
    document.getElementById('poPic').value = pic;
    document.getElementById('triggerModal').textContent = `${kode} - ${nama}`;
    document.getElementById('popupSearch').style.display = 'none';
    stopCameraScanner();
    checkFormValidity();

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
    const poJumlahInput = document.getElementById('poJumlah');

    if (triggerModal) {
        triggerModal.addEventListener('click', async function() {
            if (popupSearch) popupSearch.style.display = 'flex';
            if (searchInput) searchInput.value = '';
            
            // Jika data kosong saat diklik, coba fetch ulang otomatis
            if (!masterBarang || masterBarang.length === 0) {
                renderList([{ kode_barang: '', nama_barang: 'Memuat data dari server...', pic: '' }]);
                await loadMasterBarang();
            }
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
                let namaItem = '', kodeItem = '';
                if (Array.isArray(item)) {
                    kodeItem = (item[0] || '').toString();
                    namaItem = (item[1] || '').toString();
                } else if (typeof item === 'object' && item !== null) {
                    kodeItem = (item.kode_barang || item.kode || item.code || '').toString();
                    namaItem = (item.nama_barang || item.nama || item.name || '').toString();
                }
                return namaItem.toLowerCase().includes(keyword) || kodeItem.toLowerCase().includes(keyword);
            });
            renderList(filtered);
        });
    }

    if (poJumlahInput) {
        poJumlahInput.addEventListener('input', function() {
            checkFormValidity();
        });
    }
}

function checkFormValidity() {
    const kode = document.getElementById('poKode') ? document.getElementById('poKode').value.trim() : '';
    const jumlah = document.getElementById('poJumlah') ? document.getElementById('poJumlah').value.trim() : '';
    const btnSubmit = document.getElementById('btnSubmit');

    if (!btnSubmit) return;

    if (kode && kode !== "" && jumlah !== "" && parseInt(jumlah) > 0) {
        btnSubmit.disabled = false;
        btnSubmit.style.opacity = "1";
        btnSubmit.style.cursor = "pointer";
    } else {
        btnSubmit.disabled = true;
        btnSubmit.style.opacity = "0.4";
        btnSubmit.style.cursor = "not-allowed";
    }
}

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

function onScanSuccess(decodedText, decodedResult) {
    console.log(`Scan berhasil: ${decodedText}`);
    
    const found = masterBarang.find(item => {
        let kode = '', nama = '';
        if (Array.isArray(item)) {
            kode = (item[0] || '').toString().trim().toLowerCase();
            nama = (item[1] || '').toString().trim().toLowerCase();
        } else if (typeof item === 'object' && item !== null) {
            kode = (item.kode_barang || item.kode || item.code || '').toString().trim().toLowerCase();
            nama = (item.nama_barang || item.nama || item.name || '').toString().trim().toLowerCase();
        }
        const scan = decodedText.trim().toLowerCase();
        return kode === scan || nama.includes(scan);
    });

    if (found) {
        let kode = Array.isArray(found) ? found[0] : (found.kode_barang || found.kode || found.code || '');
        let nama = Array.isArray(found) ? found[1] : (found.nama_barang || found.nama || found.name || '');
        let pic = Array.isArray(found) ? found[2] : (found.pic || found.penanggung_jawab || '');
        
        pilihBarang(kode, nama, pic);
        alert(`Berhasil memilih barang: ${nama}`);
    } else {
        document.getElementById('poKode').value = decodedText;
        document.getElementById('triggerModal').textContent = decodedText;
        stopCameraScanner();
        checkFormValidity();
        alert(`Kode terdeteksi: ${decodedText} (Tidak ada di master barang, kode dimasukkan manual)`);

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

    if (btn) {
        btn.disabled = true;
        btn.style.opacity = "0.7";
        btn.innerHTML = `<span class="modern-spinner"></span>Mengirim...`;
    }

    if (msg) {
        msg.style.color = "#38bdf8";
        msg.innerText = "Mengirim data PO ke Google Sheets...";
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

        if (btn) {
            btn.innerHTML = `✨ Berhasil!`;
            btn.style.backgroundColor = "#10b981";
        }
        
        if (msg) {
            msg.style.color = "#10b981";
            msg.innerText = "Data PO Berhasil Disimpan di Google Sheets!";
        }

        await new Promise(resolve => setTimeout(resolve, 800));

        if (document.getElementById('poForm')) document.getElementById('poForm').reset();
        
        if (document.getElementById('poTanggal')) document.getElementById('poTanggal').value = getLocalDateString();
        if (document.getElementById('poKode')) document.getElementById('poKode').value = '';
        if (document.getElementById('poNama')) document.getElementById('poNama').value = '';
        if (document.getElementById('poPic')) document.getElementById('poPic').value = '';
        if (document.getElementById('triggerModal')) document.getElementById('triggerModal').textContent = "-- Pilih Barang dari Master --";
        
        setTimeout(() => { 
            if (msg) msg.innerText = ""; 
        }, 3000);

    } catch (err) {
        console.error("Gagal mengirim:", err);
        if (msg) {
            msg.style.color = "#ef4444";
            msg.innerText = "Terjadi kendala koneksi internet!";
        }
    } finally {
        if (btn) {
            btn.innerHTML = "Kirim PO";
            btn.style.backgroundColor = ""; 
        }
        checkFormValidity();
    }
}

// Inisialisasi Animasi Robot
function initRobotAnimation() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const robotContainer = document.getElementById('robotContainer');
    const robotBubble = document.getElementById('robotBubble');

    if (!usernameInput || !passwordInput || !robotContainer || !robotBubble) return;

    function updateRobotState() {
        setTimeout(() => {
            const activeEl = document.activeElement;
            if (activeEl === usernameInput) {
                robotContainer.classList.remove('password-active');
                robotBubble.textContent = "Halo! Masukkan username kamu ya 👤";
            } else if (activeEl === passwordInput) {
                robotContainer.classList.add('password-active');
                robotBubble.textContent = "Waduh, password rahasia! Aku tutup mata ya 🙈";
            } else {
                robotContainer.classList.remove('password-active');
                robotBubble.textContent = "Masukkan akun internal gudang";
            }
        }, 50);
    }

    usernameInput.addEventListener('focus', updateRobotState);
    usernameInput.addEventListener('blur', updateRobotState);
    passwordInput.addEventListener('focus', updateRobotState);
    passwordInput.addEventListener('blur', updateRobotState);
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
    checkFormValidity();
}