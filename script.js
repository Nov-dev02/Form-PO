const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwMxaPzNaYATNn-zMyx36NvjYQ1iwjwKYbmpezRMxE_OYWUd-JveOUbFGVMApS1ZZDdvw/exec";
let currentEditRowIndex = null;
let masterBarang = [];
let html5QrCode = null;
let isScannerActive = false;

function getLocalDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

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
    initRealTimeWeather();
    
    const today = getLocalDateString();
    const poTanggal = document.getElementById('poTanggal');
    if (poTanggal) poTanggal.value = today;

    const savedUser = localStorage.getItem('po_user');
    const loginDate = localStorage.getItem('po_login_date');

    setTimeout(() => {
        const splash = document.getElementById('appSplashScreen');
        if (splash) {
            splash.classList.add('fade-out');
            setTimeout(() => splash.remove(), 400);
        }

        if (savedUser && loginDate === today) {
            tampilkanFormPO(savedUser);
        } else {
            localStorage.clear();
            tampilkanLogin();
        }
    }, 800);

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
                btnLogin.innerHTML = "Login";
                btnLogin.disabled = false;
                btnLogin.style.opacity = "1";
            }
            if (errDiv) errDiv.innerText = "";
            tampilkanFormPO(user);
        } else {
            if (btnLogin) {
                btnLogin.innerHTML = "Login";
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
            btnLogin.innerHTML = "Login";
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


// --- GOOGLE OAUTH LOGIN HANDLER ---
function handleGoogleLogin(response) {
    const responsePayload = parseJwt(response.credential);
    const operatorName = responsePayload.name;
    const operatorEmail = responsePayload.email;
    
    const errDiv = document.getElementById('loginError');
    if (errDiv) {
        errDiv.style.color = "#10b981";
        errDiv.innerText = `Selamat datang, ${operatorName}! Membuka sistem...`;
    }

    setTimeout(() => {
        const today = getLocalDateString();
        localStorage.setItem('po_user', operatorName);
        localStorage.setItem('po_email', operatorEmail);
        localStorage.setItem('po_login_date', today);
        
        if (errDiv) errDiv.innerText = "";
        tampilkanFormPO(operatorName);
    }, 600);
}

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}


async function loadMasterBarang() {
    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'getBarang' })
        });
        const result = await response.json();
        if (result.status === 'success' && Array.isArray(result.data)) {
            masterBarang = result.data;
        }
    } catch (error) {
        console.error("Gagal mengambil data dari Google Sheets:", error);
    }
}

function renderList(data) {
    const container = document.getElementById('itemListPopup');
    if (!container) return;

    if (!data || data.length === 0) {
        container.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #94a3b8; font-size: 13px;">
                Tidak ada barang ditemukan.<br>
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
        container.innerHTML = `<div style="padding: 20px; text-align: center; color: #38bdf8; font-size: 13px;"><span class="modern-spinner"></span> Memuat data...</div>`;
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

function openRiwayatModal() {
    const modal = document.getElementById('riwayatModal');
    if (modal) modal.style.display = 'flex';
    loadRiwayatPOData();
}

function closeRiwayatModal() {
    const modal = document.getElementById('riwayatModal');
    if (modal) modal.style.display = 'none';
}

async function loadRiwayatPOData() {
    const tbody = document.getElementById('modalRiwayatTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = `<tr><td colspan="6" style="padding: 25px; text-align: center; color: #38bdf8;"><span class="modern-spinner"></span> Memuat seluruh riwayat PO...</td></tr>`;

    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'getFormPoData' })
        });
        const result = await response.json();

        if (result.status === 'success' && Array.isArray(result.data)) {
            const rows = result.data;
            if (rows.length <= 1) {
                tbody.innerHTML = `<tr><td colspan="6" style="padding: 20px; text-align: center; color: #888;">Belum ada data PO di spreadsheet.</td></tr>`;
                return;
            }

            let formattedRows = [];
            for (let i = 1; i < rows.length; i++) {
                formattedRows.push({
                    rowIndex: i + 1,
                    tanggal: rows[i][0] || '',
                    kode: rows[i][1] || '',
                    nama: rows[i][2] || '',
                    pic: rows[i][3] || '-',
                    jumlah: rows[i][4] || '0'
                });
            }

            formattedRows.reverse();

            tbody.innerHTML = formattedRows.map(item => {
                let tanggalStr = item.tanggal;
                if (tanggalStr) {
                    try {
                        const d = new Date(tanggalStr);
                        if (!isNaN(d.getTime())) {
                            tanggalStr = d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
                        }
                    } catch(e) {}
                }

                return `
                    <tr style="border-bottom: 1px solid #1e293b; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='transparent'">
                        <td style="padding: 10px; white-space: nowrap; color: #94a3b8;">${tanggalStr}</td>
                        <td style="padding: 10px; color: #38bdf8; font-weight: 500;">${item.kode}</td>
                        <td style="padding: 10px; color: #f8fafc;">${item.nama}</td>
                        <td style="padding: 10px; color: #cbd5e1;">${item.pic}</td>
                        <td style="padding: 10px; text-align: right; font-weight: 600; color: #34d399;">${item.jumlah}</td>
                        <td style="padding: 10px; text-align: center; white-space: nowrap;">
                            <button type="button" onclick="persiapkanEdit(${item.rowIndex}, '${item.tanggal}', '${item.kode}', '${item.nama}', '${item.pic}', '${item.jumlah}')" style="background: #3b82f6; border: none; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 10px; margin-right: 4px;"><i class="fas fa-edit"></i> Edit</button>
                            <button type="button" onclick="hapusDataPO(${item.rowIndex})" style="background: #ef4444; border: none; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 10px;"><i class="fas fa-trash"></i> Hapus</button>
                        </td>
                    </tr>
                `;
            }).join('');

        } else {
            tbody.innerHTML = `<tr><td colspan="6" style="padding: 20px; text-align: center; color: #ef4444;">Gagal memuat data dari spreadsheet.</td></tr>`;
        }
    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="6" style="padding: 20px; text-align: center; color: #ef4444;">Terjadi kesalahan koneksi internet.</td></tr>`;

    }
}

function persiapkanEdit(rowIndex, tanggal, kode, nama, pic, jumlah) {
    currentEditRowIndex = rowIndex;
    
    if (tanggal) {
        try {
            const d = new Date(tanggal);
            if (!isNaN(d.getTime())) {
                document.getElementById('poTanggal').value = d.toISOString().split('T')[0];
            }
        } catch(e) {
            document.getElementById('poTanggal').value = getLocalDateString();
        }
    }
    
    document.getElementById('poKode').value = kode;
    document.getElementById('poNama').value = nama;
    document.getElementById('poPic').value = pic;
    document.getElementById('poJumlah').value = jumlah;
    document.getElementById('triggerModal').textContent = `${kode} - ${nama}`;
    
    const btnSubmit = document.getElementById('btnSubmit');
    if (btnSubmit) {
        btnSubmit.innerHTML = "💾 Update Data PO";
        btnSubmit.style.background = "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)";
    }

    closeRiwayatModal();
    checkFormValidity();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
async function hapusDataPO(rowIndex) {
    showCustomConfirm("Apakah kamu yakin ingin menghapus data PO ini dari Form PO & Database_PO secara permanen?", async () => {
        try {
            const response = await fetch(WEB_APP_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'deletePO',
                    rowIndex: rowIndex
                })
            });
            const result = await response.json();

            if (result.status === 'success') {
                showCustomAlert("Data PO berhasil dihapus!");
                loadRiwayatPOData();
            } else {
                showCustomAlert("Gagal menghapus data: " + result.message);
            }
        } catch (err) {
            console.error(err);
            showCustomAlert("Terjadi kesalahan koneksi saat menghapus data.");
        }
    });
}

function persiapkanEdit(rowIndex, tanggal, kode, nama, pic, jumlah) {
    currentEditRowIndex = rowIndex;
    
    if (tanggal) {
        try {
            const d = new Date(tanggal);
            if (!isNaN(d.getTime())) {
                document.getElementById('poTanggal').value = d.toISOString().split('T')[0];
            }
        } catch(e) {
            document.getElementById('poTanggal').value = getLocalDateString();
        }
    }
    
    document.getElementById('poKode').value = kode;
    document.getElementById('poNama').value = nama;
    document.getElementById('poPic').value = pic;
    document.getElementById('poJumlah').value = jumlah;
    document.getElementById('triggerModal').textContent = `${kode} - ${nama}`;
    
    const btnSubmit = document.getElementById('btnSubmit');
    if (btnSubmit) {
        btnSubmit.innerHTML = "💾 Update Data PO";
        btnSubmit.style.background = "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)";
    }

    closeRiwayatModal();
    checkFormValidity();
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        alert(`Kode terdeteksi: ${decodedText} (Dimasukkan manual)`);

        setTimeout(() => {
            const submitBtn = document.querySelector('#poSection button[type="submit"]');
            if (submitBtn) {
                submitBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 150);
    }
}

function onScanFailure(error) {}

// Fungsi Submit yang Otomatis Mendeteksi Mode Kirim Baru ATAU Update Edit
async function submitPO(e) {
    if (e) e.preventDefault();
    const btn = document.getElementById('btnSubmit');
    const msg = document.getElementById('poMessage');

    const isEditMode = (currentEditRowIndex !== null);
    const actionType = isEditMode ? 'updatePO' : 'submitPO';

    if (btn) {
        btn.disabled = true;
        btn.style.opacity = "0.7";
        btn.innerHTML = `<span class="modern-spinner"></span>${isEditMode ? 'Memperbarui...' : 'Mengirim...'}`;
    }

    if (msg) {
        msg.style.color = "#38bdf8";
        msg.innerText = isEditMode ? "Memperbarui data di kedua sheet..." : "Mengirim data PO ke Google Sheets...";
    }

    const dataPO = {
        action: actionType,
        rowIndex: currentEditRowIndex,
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
            if (btn) {
                btn.innerHTML = `✨ Berhasil!`;
                btn.style.backgroundColor = "#10b981";
            }
            
            if (msg) {
                msg.style.color = "#10b981";
                msg.innerText = isEditMode ? "Data PO Berhasil Diperbarui di Kedua Sheet!" : "Data PO Berhasil Disimpan!";
            }

            await new Promise(resolve => setTimeout(resolve, 800));

            if (document.getElementById('poForm')) document.getElementById('poForm').reset();


            if (document.getElementById('poTanggal')) document.getElementById('poTanggal').value = getLocalDateString();
            if (document.getElementById('poKode')) document.getElementById('poKode').value = '';
            if (document.getElementById('poNama')) document.getElementById('poNama').value = '';
            if (document.getElementById('poPic')) document.getElementById('poPic').value = '';
            if (document.getElementById('triggerModal')) document.getElementById('triggerModal').textContent = "-- Pilih Barang dari Master --";
            
            if (btn) {
                btn.innerHTML = "Kirim";
                btn.style.background = ""; 
            }

        } else {
            alert("Gagal: " + result.message);
            if (btn) {
                btn.innerHTML = isEditMode ? "💾 Update Data PO" : "Kirim";
                btn.disabled = false;
                btn.style.opacity = "1";
            }
        }

        setTimeout(() => { if (msg) msg.innerText = ""; }, 3000);

    } catch (err) {
        console.error("Gagal mengirim:", err);
        if (msg) {
            msg.style.color = "#ef4444";
            msg.innerText = "Terjadi kendala koneksi internet!";
        }
        if (btn) {
            btn.innerHTML = isEditMode ? "💾 Update Data PO" : "Kirim";
            btn.disabled = false;
            btn.style.opacity = "1";
        }
    } finally {
        checkFormValidity();
    }
}

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
    const eyeIconToggle = document.getElementById('eyeIconToggle');
    
    if (!passwordInput || !eyeIconToggle) return;

    const isPassword = passwordInput.getAttribute('type') === 'password';
    
    if (isPassword) {
        passwordInput.setAttribute('type', 'text');
        eyeIconToggle.className = "fa-solid fa-eye";
    } else {
        passwordInput.setAttribute('type', 'password');
        eyeIconToggle.className = "fa-solid fa-eye-slash";
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

// --- FUNGSI TRIGGER GOOGLE OAUTH ---
function triggerGoogleLogin() {
    // Memanggil prompt login Google secara otomatis saat tombol kustom diklik
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                // Fallback jika One Tap diblokir browser, arahkan user interaksi manual
                console.log("Google One Tap prompt tidak muncul, periksa konfigurasi akun atau popup blocker.");
                alert("Silakan pastikan browser mengizinkan pop-up untuk melanjutkan login Google.");
            }
        });
    } else {
        alert("Google API belum dimuat sepenuhnya. Pastikan terhubung ke internet.");
    }
}

// --- FITUR CUACA REAL-TIME (DENGAN PEMICU SENTUHAN PERTAMA & AUTO-FALLBACK) ---
function initRealTimeWeather() {
    const tempEl = document.getElementById('weatherTemp');
    const condEl = document.getElementById('weatherCondition');
    const locEl = document.getElementById('weatherLocation'); 
    const iconEl = document.getElementById('weatherIconContainer');

    if (!tempEl) return;

    // Fungsi utama untuk mengeksekusi GPS & Open-Meteo
    const fetchWeatherByGPS = () => {
        if (!navigator.geolocation) {
            fetchDefaultWeather(-7.275, 112.793);
            return;
        }

        if(locEl) locEl.textContent = "Menemukan lokasi...";
        if(condEl) condEl.textContent = "Memuat Cuaca...";

        let gpsResolved = false;

        // Timer pengaman: Jika dalam 4 detik GPS tidak merespons, alihkan ke default Mulyorejo
        const fallbackTimer = setTimeout(() => {
            if (!gpsResolved) {
                console.warn("GPS timeout, menggunakan lokasi default Mulyorejo.");
                fetchDefaultWeather(-7.275, 112.793);
            }
        }, 4000);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                gpsResolved = true;
                clearTimeout(fallbackTimer);
                
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                try {
                    // 1. Ambil nama wilayah menggunakan Reverse Geocoding
                    const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`);
                    const geoData = await geoRes.json();
                    
                    const address = geoData.address || {};
                    const wilayah = address.village || address.suburb || address.city_district || address.city || "Lokasi Anda";
                    if(locEl) locEl.textContent = wilayah;

                    // 2. Ambil data cuaca dari Open-Meteo API
                    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`);
                    const weatherData = await weatherRes.json();

                    const temp = Math.round(weatherData.current.temperature_2m);
                    const wCode = weatherData.current.weather_code;

                    if(tempEl) tempEl.textContent = `${temp}°C`;
                    
                    const weatherInfo = getWeatherDescription(wCode);
                    if(condEl) condEl.textContent = weatherInfo.text;
                    if(iconEl) iconEl.innerHTML = `<i class="${weatherInfo.icon}"></i>`;

                } catch (err) {
                    console.error("Gagal mengambil data cuaca:", err);
                    fetchDefaultWeather(lat, lon);
                }
            }, 
            (error) => {
                gpsResolved = true;
                clearTimeout(fallbackTimer);
                console.warn("Izin lokasi ditolak:", error.message);
                fetchDefaultWeather(-7.275, 112.793); // Fallback ke Mulyorejo jika ditolak
            }, 
            { 
                enableHighAccuracy: false, 
                timeout: 3500, 
                maximumAge: 60000 
            }
        );
    };

    // Trik Pemancing Izin: Tangkap sentuhan/klik pertama user di layar agar browser merestui pop-up GPS
    const triggerPermissionOnTouch = () => {
        fetchWeatherByGPS();
        // Hapus listener setelah sentuhan pertama agar tidak terpanggil terus
        window.removeEventListener('click', triggerPermissionOnTouch);
        window.removeEventListener('touchstart', triggerPermissionOnTouch);
    };

    window.addEventListener('click', triggerPermissionOnTouch, { once: true });
    window.addEventListener('touchstart', triggerPermissionOnTouch, { once: true });
}

// Fungsi cadangan / default jika GPS gagal atau ditolak
async function fetchDefaultWeather(lat, lon) {
    try {
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`);
        const weatherData = await weatherRes.json();
        
        const tempEl = document.getElementById('weatherTemp');
        const condEl = document.getElementById('weatherCondition');
        const locEl = document.getElementById('weatherLocation');
        const iconEl = document.getElementById('weatherIconContainer');

        if(tempEl) tempEl.textContent = `${Math.round(weatherData.current.temperature_2m)}°C`;
        const info = getWeatherDescription(weatherData.current.weather_code);
        if(condEl) condEl.textContent = info.text;
        if(iconEl) iconEl.innerHTML = `<i class="${info.icon}"></i>`;
        if(locEl) locEl.textContent = "Mulyorejo, Surabaya";
    } catch(e) {
        const condEl = document.getElementById('weatherCondition');
        if(condEl) condEl.textContent = "Cerah Berawan";
    }
}

// Helper pengubah kode cuaca API ke teks Indonesia dan ikon Font Awesome
function getWeatherDescription(code) {
    if (code === 0) return { text: "Cerah", icon: "fa-solid fa-sun" };
    if (code >= 1 && code <= 3) return { text: "Berawan", icon: "fa-solid fa-cloud-sun" };
    if (code >= 45 && code <= 48) return { text: "Berkabut", icon: "fa-solid fa-smog" };
    if (code >= 51 && code <= 67) return { text: "Gerimis / Hujan Ringan", icon: "fa-solid fa-cloud-rain" };
    if (code >= 71 && code <= 77) return { text: "Salju", icon: "fa-solid fa-snowflake" };
    if (code >= 80 && code <= 82) return { text: "Hujan Lebat", icon: "fa-solid fa-cloud-showers-heavy" };
    if (code >= 95 && code <= 99) return { text: "Badai Petir", icon: "fa-solid fa-cloud-bolt" };
    return { text: "Berawan", icon: "fa-solid fa-cloud" };
}
function showCustomConfirm(message, onYes) {
    // Cek apakah modal kustom sudah ada di HTML, kalau belum buat secara otomatis
    let modalOverlay = document.getElementById('customConfirmModal');
    if (!modalOverlay) {
        modalOverlay = document.createElement('div');
        modalOverlay.id = 'customConfirmModal';
        modalOverlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999;';
        modalOverlay.innerHTML = `
            <div style="background: #1e293b; border: 1px solid #334155; padding: 24px; border-radius: 12px; width: 90%; max-width: 380px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); text-align: center; color: #f8fafc; font-family: inherit;">
                <div style="font-size: 16px; font-weight: 600; margin-bottom: 12px;" id="customConfirmText"></div>
                <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                    <button id="btnCustomNo" style="flex: 1; padding: 10px; background: #334155; border: none; color: white; border-radius: 6px; cursor: pointer; font-weight: 600;">Batal</button>
                    <button id="btnCustomYes" style="flex: 1; padding: 10px; background: #ef4444; border: none; color: white; border-radius: 6px; cursor: pointer; font-weight: 600;">Ya, Hapus</button>
                </div>
            </div>
        `;
        document.body.appendChild(modalOverlay);
    }

    document.getElementById('customConfirmText').innerText = message;
    modalOverlay.style.display = 'flex';

    const btnYes = document.getElementById('btnCustomYes');
    const btnNo = document.getElementById('btnCustomNo');

    // Bersihkan event listener sebelumnya supaya tidak menumpuk
    const newBtnYes = btnYes.cloneNode(true);
    const newBtnNo = btnNo.cloneNode(true);
    btnYes.parentNode.replaceChild(newBtnYes, btnYes);
    btnNo.parentNode.replaceChild(newBtnNo, btnNo);

    newBtnYes.addEventListener('click', () => {
        modalOverlay.style.display = 'none';
        onYes();
    });

    newBtnNo.addEventListener('click', () => {
        modalOverlay.style.display = 'none';
    });
}

function showCustomAlert(message) {
    let alertOverlay = document.getElementById('customAlertModal');
    if (!alertOverlay) {
        alertOverlay = document.createElement('div');
        alertOverlay.id = 'customAlertModal';
        alertOverlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999;';
        alertOverlay.innerHTML = `
            <div style="background: #1e293b; border: 1px solid #334155; padding: 24px; border-radius: 12px; width: 90%; max-width: 380px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); text-align: center; color: #f8fafc; font-family: inherit;">
                <div style="font-size: 15px; font-weight: 500; margin-bottom: 20px; line-height: 1.5;" id="customAlertText"></div>
                <button id="btnCustomOk" style="width: 100%; padding: 10px; background: #3b82f6; border: none; color: white; border-radius: 6px; cursor: pointer; font-weight: 600;">OK</button>
            </div>
        `;
        document.body.appendChild(alertOverlay);
    }

    document.getElementById('customAlertText').innerText = message;
    alertOverlay.style.display = 'flex';

    const btnOk = document.getElementById('btnCustomOk');
    const newBtnOk = btnOk.cloneNode(true);
    btnOk.parentNode.replaceChild(newBtnOk, btnOk);

    newBtnOk.addEventListener('click', () => {
        alertOverlay.style.display = 'none';
    });
}
// Konfigurasi Firebase Web (Nanti disesuaikan dengan project Firebase kamu)
const firebaseConfig = {
  apiKey: "API_KEY_KAMU_DARI_FIREBASE",
  projectId: "PROJECT_ID_KAMU",
  messagingSenderId: "SENDER_ID_KAMU",
  appId: "APP_ID_KAMU"
};

// Inisialisasi Firebase di Frontend
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Fungsi untuk meminta izin notifikasi ke HP
async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Izin notifikasi diberikan.');
      
      // Ambil Token FCM perangkat ini
      const token = await messaging.getToken({ 
        vapidKey: 'VAPID_KEY_DARI_FIREBASE_CONSOLE' 
      });
      
      if (token) {
        console.log('FCM Token perangkat:', token);
        // Simpan token ini ke Google Sheets/Database supaya bisa dikirimi pesan otomatis!
      } else {
        console.warn('Gagal mendapatkan token FCM.');
      }
    } else {
      console.log('Izin notifikasi ditolak.');
    }
  } catch (error) {
    console.error('Terjadi kesalahan saat meminta izin notifikasi:', error);
  }
}
