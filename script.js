const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxte5kTB8H88pQ2DKUp4CE0mrnu_3egJhvfApOuERvUOrLKKGrumrf0IVvhRlCpEJktNQ/exec";

let masterBarang = [];
let selectedItemData = null;

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

// Inisialisasi elemen Pop-up Search
const triggerModal = document.getElementById('triggerModal');
const popupSearch = document.getElementById('popupSearch');
const searchInput = document.getElementById('searchInputPopup');
const itemList = document.getElementById('itemListPopup');
const clearBtn = document.getElementById('clearInputBtn');
const btnDone = document.getElementById('btnDone');

if (triggerModal) {
    triggerModal.addEventListener('click', function() {
        popupSearch.style.display = 'flex';
        searchInput.value = '';
        renderList(masterBarang);
        searchInput.focus();
    });
}

if (btnDone) {
    btnDone.addEventListener('click', function() {
        popupSearch.style.display = 'none';
        if (selectedItemData) {
            const namaVal = selectedItemData.nama_barang || selectedItemData.nama || '';
            const kodeVal = selectedItemData.kode_barang || selectedItemData.kode || '';
            const picVal = selectedItemData.pic || '';

            if (triggerModal) triggerModal.textContent = namaVal;
            
            if (document.getElementById('poKode')) document.getElementById('poKode').value = kodeVal;
            if (document.getElementById('poNama')) document.getElementById('poNama').value = namaVal;
            if (document.getElementById('poPic')) document.getElementById('poPic').value = picVal;
        }
    });
}

if (clearBtn) {
    clearBtn.addEventListener('click', function() {
        searchInput.value = '';
        renderList(masterBarang);
        searchInput.focus();
    });
}

if (searchInput) {
    searchInput.addEventListener('input', function() {
        const keyword = this.value.toLowerCase();
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
        itemList.innerHTML = `<div style="padding: 15px; color: #777; text-align: center;">Barang tidak ditemukan</div>`;
        return;
    }

    data.forEach(item => {
        const namaItem = item.nama_barang || item.nama || 'Tanpa Nama';
        const kodeItem = item.kode_barang || item.kode || '';
        const div = document.createElement('div');
        div.className = 'item-pilihan';
        div.style.padding = "10px";
        div.style.borderBottom = "1px solid #333";
        div.style.cursor = "pointer";
        div.innerHTML = `
            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                <input type="radio" name="pilihanBarang" ${selectedItemData && (selectedItemData.kode === kodeItem || selectedItemData.kode_barang === kodeItem) ? 'checked' : ''}>
                <span>[${kodeItem}] ${namaItem}</span>
            </label>
        `;
        
        div.addEventListener('click', function() {
            const radio = div.querySelector('input[type="radio"]');
            radio.checked = true;
            selectedItemData = item;
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
            if (triggerModal) triggerModal.textContent = "Pilih Barang";
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