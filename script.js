const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyPE82yBEktcrtxrbNS2nAwQCVGVYTVnQu-DJR3ZqicXRA2q0DUJ6FPfOhNNC6rJA5YZw/exec";
const CURRENT_APP_VERSION = "v1.1.0"; // 🚀 Update versi

let masterBarang = [];
let html5QrCode = null;
let isScannerActive = false;

// ==========================================
// 🚀 AUTO-UPDATE & FORCE REFRESH SYSTEM
// ==========================================
async function cekPembaruanAplikasi() {
    try {
        const response = await fetch('./version.json?v=' + Date.now(), { cache: 'no-store' });
        const data = await response.json();
        const versiTersimpan = localStorage.getItem('gudang_skip_version');

        if (data.version && data.version !== CURRENT_APP_VERSION && versiTersimpan !== data.version) {
            tampilkanModalPaksaUpdate(data.version);
        }
    } catch (err) {
        console.log("Auto-update check skipped:", err);
    }
}

function tampilkanModalPaksaUpdate(targetVersion) {
    let modal = document.getElementById('forceUpdateModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'forceUpdateModal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(15, 23, 42, 0.98); display: flex; justify-content: center;
            align-items: center; z-index: 9999999; padding: 20px; box-sizing: border-box;
            backdrop-filter: blur(8px);
        `;
        modal.innerHTML = `
            <div style="background: linear-gradient(145deg, #1e293b, #0f172a); border: 1px solid rgba(56, 189, 248, 0.3); padding: 30px 25px; border-radius: 20px; max-width: 380px; width: 100%; text-align: center; color: #fff; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);">
                <div style="width: 60px; height: 60px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto; font-size: 26px; color: #38bdf8;">
                    <i class="fa-solid fa-arrows-rotate"></i>
                </div>
                <h3 style="margin-bottom: 12px; font-size: 20px; font-weight: 700; color: #f8fafc;">Pembaruan Sistem Tersedia</h3>
                <p style="font-size: 13px; color: #94a3b8; margin-bottom: 25px; line-height: 1.5;">
                    Versi baru Gudang Nuhsantara dengan fitur notifikasi rekap otomatis telah dirilis. Silakan perbarui sekarang untuk melanjutkan.
                </p>
                <button id="btnExecuteUpdate" style="
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; border: none; padding: 14px 20px;
                    border-radius: 12px; font-weight: 600; font-size: 15px; width: 100%; cursor: pointer;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
                ">
                    Perbarui Sekarang
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    } else {
        modal.style.display = 'flex';
    }

    document.getElementById('btnExecuteUpdate').onclick = async () => {
        const btn = document.getElementById('btnExecuteUpdate');
        btn.innerText = "Memperbarui...";
        btn.disabled = true;

        try {
            localStorage.setItem('gudang_skip_version', targetVersion);
            if ('serviceWorker' in navigator) {
                const regs = await navigator.serviceWorker.getRegistrations();
                for (let reg of regs) { await reg.unregister(); }
            }
            if ('caches' in window) {
                const keys = await caches.keys();
                for (let key of keys) { await caches.delete(key); }
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (e) {
            console.log("Cleanup error:", e);
        }

        modal.style.display = 'none';
        window.location.reload(true);
    };
}

// ==========================================
// 🎨 CUSTOM MODERN MODAL HELPER
// ==========================================
function showCustomModal({ title = "Informasi", message = "", type = "info", showCancel = false, confirmText = "OK", cancelText = "Batal" }) {
    return new Promise((resolve) => {
        const modalBox = document.getElementById('customModalBox');
        const wrapper = document.getElementById('modalContentWrapper');
        const titleEl = document.getElementById('modalTitle');
        const msgEl = document.getElementById('modalMessage');
        const iconEl = document.getElementById('modalIcon');
        const iconContainer = document.getElementById('modalIconContainer');
        const btnConfirm = document.getElementById('modalBtnConfirm');
        const btnCancel = document.getElementById('modalBtnCancel');

        if (!modalBox || !wrapper) { resolve(true); return; }

        if (titleEl) titleEl.textContent = title;
        if (msgEl) msgEl.textContent = message;
        if (btnConfirm) btnConfirm.textContent = confirmText;
        if (btnCancel) btnCancel.textContent = cancelText;

        if (iconEl && iconContainer && btnConfirm) {
            if (type === 'success') {
                iconEl.className = "fa-solid fa-check";
                iconContainer.style.background = "rgba(16, 185, 129, 0.15)";
                iconContainer.style.borderColor = "rgba(16, 185, 129, 0.4)";
                iconContainer.style.color = "#10b981";
                btnConfirm.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
            } else if (type === 'error') {
                iconEl.className = "fa-solid fa-triangle-exclamation";
                iconContainer.style.background = "rgba(239, 68, 68, 0.15)";
                iconContainer.style.borderColor = "rgba(239, 68, 68, 0.4)";
                iconContainer.style.color = "#ef4444";
                btnConfirm.style.background = "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
            } else if (type === 'warning') {
                iconEl.className = "fa-solid fa-circle-question";
                iconContainer.style.background = "rgba(245, 158, 11, 0.15)";
                iconContainer.style.borderColor = "rgba(245, 158, 11, 0.4)";
                iconContainer.style.color = "#f59e0b";
                btnConfirm.style.background = "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)";
            } else {
                iconEl.className = "fa-solid fa-circle-info";
                iconContainer.style.background = "rgba(56, 189, 248, 0.15)";
                iconContainer.style.borderColor = "rgba(56, 189, 248, 0.4)";
                iconContainer.style.color = "#38bdf8";
                btnConfirm.style.background = "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)";
            }
        }

        if (btnCancel) btnCancel.style.display = showCancel ? "block" : "none";

        modalBox.style.display = "flex";
        setTimeout(() => {
            wrapper.style.transform = "scale(1)";
            wrapper.style.opacity = "1";
        }, 10);

        const cleanup = (result) => {
            wrapper.style.transform = "scale(0.9)";
            wrapper.style.opacity = "0";
            setTimeout(() => {
                modalBox.style.display = "none";
                if (btnConfirm) btnConfirm.onclick = null;
                if (btnCancel) btnCancel.onclick = null;
                resolve(result);
            }, 200);
        };

        if (btnConfirm) btnConfirm.onclick = () => cleanup(true);
        if (btnCancel) btnCancel.onclick = () => cleanup(false);
    });
}

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
            border: none !important; border-radius: 8px !important; font-weight: 600 !important;
            transition: all 0.3s ease !important; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3) !important;
        }
        .modern-spinner {
            display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: #ffffff; border-radius: 50%; animation: spinBtn 0.8s linear infinite;
            vertical-align: middle; margin-right: 8px;
        }
        @keyframes spinBtn { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);
}

function updateRealTimeClock() {
    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    document.querySelectorAll('.real-time-clock').forEach(el => { el.textContent = timeString; });
}
setInterval(updateRealTimeClock, 1000);

function setDynamicGreeting(username) {
    const greetingEl = document.getElementById('userGreeting');
    if (!greetingEl) return;
    greetingEl.innerHTML = `Selamat datang, <b>${username}</b>! <br><span style="font-size: 11px; color: #94a3b8;">Pastikan data PO tercatat dengan akurat.</span>`;
}

window.onload = function() {
    updateRealTimeClock();
    injectModernStyles();
    initRealTimeWeather();
    cekPembaruanAplikasi();
    
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

    // 🟢 PANGGIL NOTIFIKASI & FCM TOKEN DI SINI (SETELAH USER LOGIN)
    setTimeout(checkAndForceNotification, 1500);
}

async function handleLogin() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errDiv = document.getElementById('loginError');
    const btnLogin = document.getElementById('btnLogin');

    const user = usernameInput ? usernameInput.value.trim() : '';
    const pass = passwordInput ? passwordInput.value.trim() : '';

    if (!user || !pass) {
        if (errDiv) { errDiv.style.color = "#ef4444"; errDiv.innerText = "Username dan password wajib diisi!"; }
        return;
    }

    try {
        if (btnLogin) { btnLogin.disabled = true; btnLogin.innerHTML = `<span class="modern-spinner"></span>Memproses...`; }
        
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'login', username: user, password: pass })
        });
        const result = await response.json();

        if (result.status === 'success') {
            const today = getLocalDateString();
            localStorage.setItem('po_user', user);
            localStorage.setItem('po_login_date', today);
            tampilkanFormPO(user);
        } else {
            if (btnLogin) { btnLogin.innerHTML = "Login"; btnLogin.disabled = false; }
            if (errDiv) { errDiv.style.color = "#ef4444"; errDiv.innerText = result.message || "Username atau password salah!"; }
        }
    } catch (err) {
        if (btnLogin) { btnLogin.innerHTML = "Login"; btnLogin.disabled = false; }
        if (errDiv) { errDiv.style.color = "#ef4444"; errDiv.innerText = "Gagal terhubung ke server!"; }
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
        if (result.status === 'success' && Array.isArray(result.data)) {
            masterBarang = result.data;
        }
    } catch (error) {
        console.error("Gagal mengambil master barang:", error);
    }
}

function renderList(data) {
    const container = document.getElementById('itemListPopup');
    if (!container) return;

    if (!data || data.length === 0) {
        container.innerHTML = `<div style="padding: 20px; text-align: center; color: #94a3b8; font-size: 13px;">Tidak ada barang ditemukan.</div>`;
        return;
    }

    container.innerHTML = data.map(item => {
        let kode = item.kode_barang || item[0] || '-';
        let nama = item.nama_barang || item[1] || '-';
        let pic = item.pic || item[2] || '-';
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

function pilihBarang(kode, nama, pic) {
    document.getElementById('poKode').value = kode;
    document.getElementById('poNama').value = nama;
    document.getElementById('poPic').value = pic;
    document.getElementById('triggerModal').textContent = `${kode} - ${nama}`;
    document.getElementById('popupSearch').style.display = 'none';
    checkFormValidity();
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
    tbody.innerHTML = `<tr><td colspan="6" style="padding: 25px; text-align: center; color: #38bdf8;"><span class="modern-spinner"></span> Memuat riwayat...</td></tr>`;

    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'getFormPoData' })
        });
        const result = await response.json();

        if (result.status === 'success' && Array.isArray(result.data)) {
            const rows = result.data;
            if (rows.length <= 1) {
                tbody.innerHTML = `<tr><td colspan="6" style="padding: 20px; text-align: center; color: #888;">Belum ada data PO.</td></tr>`;
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

            tbody.innerHTML = formattedRows.map(item => `
                <tr style="border-bottom: 1px solid #1e293b;">
                    <td style="padding: 10px; color: #94a3b8;">${item.tanggal}</td>
                    <td style="padding: 10px; color: #38bdf8;">${item.kode}</td>
                    <td style="padding: 10px; color: #f8fafc;">${item.nama}</td>
                    <td style="padding: 10px; color: #cbd5e1;">${item.pic}</td>
                    <td style="padding: 10px; text-align: right; color: #34d399;">${item.jumlah}</td>
                    <td style="padding: 10px; text-align: center;">
                        <button type="button" onclick="hapusDataPO(${item.rowIndex})" style="background: #ef4444; border: none; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 10px;"><i class="fa-solid fa-trash"></i> Hapus</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) {
        console.error(err);
    }
}

async function hapusDataPO(rowIndex) {
    const isConfirmed = await showCustomModal({
        title: "Konfirmasi Hapus",
        message: "Yakin ingin menghapus data PO ini?",
        type: "warning",
        showCancel: true,
        confirmText: "Ya, Hapus"
    });
    if (!isConfirmed) return;

    try {
        await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'deletePO', rowIndex: rowIndex })
        });
        loadRiwayatPOData();
    } catch (err) {
        console.error(err);
    }
}

function initEventListeners() {
    const triggerModal = document.getElementById('triggerModal');
    const popupSearch = document.getElementById('popupSearch');
    const btnCloseModal = document.getElementById('btnCloseModal');
    const searchInput = document.getElementById('searchInputPopup');
    const poJumlahInput = document.getElementById('poJumlah');

    if (triggerModal) {
        triggerModal.addEventListener('click', async () => {
            if (popupSearch) popupSearch.style.display = 'flex';
            if (!masterBarang.length) await loadMasterBarang();
            renderList(masterBarang);
        });
    }
    if (btnCloseModal) btnCloseModal.addEventListener('click', () => { if (popupSearch) popupSearch.style.display = 'none'; });
    if (poJumlahInput) poJumlahInput.addEventListener('input', checkFormValidity);
}

function checkFormValidity() {
    const kode = document.getElementById('poKode')?.value.trim() || '';
    const jumlah = document.getElementById('poJumlah')?.value.trim() || '';
    const btnSubmit = document.getElementById('btnSubmit');
    if (!btnSubmit) return;

    if (kode && jumlah && parseInt(jumlah) > 0) {
        btnSubmit.disabled = false;
        btnSubmit.style.opacity = "1";
        btnSubmit.style.cursor = "pointer";
    } else {
        btnSubmit.disabled = true;
        btnSubmit.style.opacity = "0.4";
        btnSubmit.style.cursor = "not-allowed";
    }
}

async function submitPO(e) {
    if (e) e.preventDefault();
    const btn = document.getElementById('btnSubmit');
    const msg = document.getElementById('poMessage');

    if (btn) { btn.disabled = true; btn.innerHTML = `<span class="modern-spinner"></span>Mengirim...`; }

    const dataPO = {
        action: 'submitPO',
        tanggal: document.getElementById('poTanggal')?.value || '',
        kodeBarang: document.getElementById('poKode')?.value || '',
        namaBarang: document.getElementById('poNama')?.value || '',
        pic: document.getElementById('poPic')?.value || '',
        jumlah: document.getElementById('poJumlah')?.value || ''
    };

    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify(dataPO)
        });
        const result = await response.json();

        if (result.status === 'success') {
            if (msg) { msg.style.color = "#10b981"; msg.innerText = "Data PO Berhasil Disimpan!"; }
            document.getElementById('poForm')?.reset();
            document.getElementById('poTanggal').value = getLocalDateString();
            document.getElementById('triggerModal').textContent = "-- Pilih Barang dari Master --";
        } else {
            showCustomModal({ title: "Gagal", message: result.message, type: "error" });
        }
    } catch (err) {
        console.error(err);
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = "Kirim"; }
        checkFormValidity();
    }
}

function handleLogout() {
    localStorage.clear();
    tampilkanLogin();
}

function initRealTimeWeather() {
    const tempEl = document.getElementById('weatherTemp');
    if (!tempEl) return;
    tempEl.textContent = "30°C";
}

// ==========================================
// 🔔 REGISTRASI FCM TOKEN & NOTIFIKASI
// ==========================================
async function registerFCMTokenToServer(tokenValue) {
    const currentUser = localStorage.getItem('po_user');
    if (!tokenValue || !currentUser) return;

    try {
        await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'saveFCMToken',
                user: currentUser, // Terkirim nama user yang valid!
                token: tokenValue
            })
        });
        console.log("FCM Token terdaftar atas nama:", currentUser);
    } catch (err) {
        console.error("Gagal daftar FCM:", err);
    }
}

function checkAndForceNotification() {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted" || localStorage.getItem("gudang_notif_allowed") === "true") return;
    showForceNotificationModal();
}

function showForceNotificationModal() {
    let modal = document.getElementById('forceNotificationModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'forceNotificationModal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(15, 23, 42, 0.95); display: flex; justify-content: center;
            align-items: center; z-index: 999999; padding: 20px; box-sizing: border-box;
            backdrop-filter: blur(8px);
        `;
        modal.innerHTML = `
            <div style="background: linear-gradient(145deg, #1e293b, #0f172a); border: 1px solid rgba(56, 189, 248, 0.3); padding: 30px 25px; border-radius: 20px; max-width: 380px; width: 100%; text-align: center; color: #fff;">
                <h3 style="margin-bottom: 12px; font-size: 20px; color: #f8fafc;">Aktifkan Notifikasi</h3>
                <p style="font-size: 13px; color: #94a3b8; margin-bottom: 25px;">Mohon aktifkan izin notifikasi untuk menerima rekap harian.</p>
                <button id="btnAllowNotif" style="background: #10b981; color: white; border: none; padding: 14px 20px; border-radius: 12px; font-weight: 600; width: 100%; cursor: pointer;">Izinkan Notifikasi</button>
            </div>
        `;
        document.body.appendChild(modal);
    } else {
        modal.style.display = 'flex';
    }

    document.getElementById('btnAllowNotif').onclick = async () => {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            localStorage.setItem("gudang_notif_allowed", "true");
            modal.style.display = 'none';
            
            let deviceToken = localStorage.getItem("gudang_device_token");
            if (!deviceToken) {
                deviceToken = "token_" + Math.random().toString(36).substring(2) + "_" + Date.now();
                localStorage.setItem("gudang_device_token", deviceToken);
            }
            registerFCMTokenToServer(deviceToken);
        }
    };
}
