let masterBarang = [];

// Ambil data otomatis dari Google Apps Script Web App
async function loadMasterBarang() {
    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbyPE82yBEktcrtxrbNS2nAwQCVGVYTVnQu-DJR3ZqicXRA2q0DUJ6FPfOhNNC6rJA5YZw/exec');
        masterBarang = await response.json();
    } catch (error) {
        console.error("Gagal mengambil data dari Google Sheets:", error);
    }
}

// Jalankan fungsi pengambilan data saat halaman dibuka
loadMasterBarang();

const triggerModal = document.getElementById('triggerModal');
const popupSearch = document.getElementById('popupSearch');
const searchInput = document.getElementById('searchInputPopup');
const itemList = document.getElementById('itemListPopup');
const clearBtn = document.getElementById('clearInputBtn');
const btnDone = document.getElementById('btnDone');

let selectedItemData = null;

// Buka pop-up saat kotak utama diklik
triggerModal.addEventListener('click', function() {
    popupSearch.style.display = 'flex';
    searchInput.value = '';
    renderList(masterBarang);
    searchInput.focus();
});

// Tutup pop-up & masukkan data terpilih ke form saat tombol Done diklik
btnDone.addEventListener('click', function() {
    popupSearch.style.display = 'none';
    if (selectedItemData) {
        // Menyesuaikan dengan nama kolom di Google Sheet (misal: nama_barang, kode_barang, pic)
        const namaVal = selectedItemData.nama_barang || selectedItemData.nama || '';
        const kodeVal = selectedItemData.kode_barang || selectedItemData.kode || '';
        const picVal = selectedItemData.pic || '';

        triggerModal.textContent = namaVal;
        
        if(document.getElementById('kodeBarang')) document.getElementById('kodeBarang').value = kodeVal;
        if(document.getElementById('namaBarang')) document.getElementById('namaBarang').value = namaVal;
        if(document.getElementById('picBarang')) document.getElementById('picBarang').value = picVal;
    }
});

// Tombol silang (X) untuk menghapus ketikan pencarian
clearBtn.addEventListener('click', function() {
    searchInput.value = '';
    renderList(masterBarang);
    searchInput.focus();
});

// Fungsi filter saat diketik di kotak pencarian pop-up
searchInput.addEventListener('input', function() {
    const keyword = this.value.toLowerCase();
    const filtered = masterBarang.filter(item => {
        const namaItem = item.nama_barang || item.nama || '';
        return namaItem.toLowerCase().includes(keyword);
    });
    renderList(filtered);
});

// Fungsi menampilkan daftar barang ke dalam pop-up
function renderList(data) {
    itemList.innerHTML = '';
    if (data.length === 0) {
        itemList.innerHTML = `<div style="padding: 15px; color: #777; text-align: center;">Barang tidak ditemukan</div>`;
        return;
    }

    data.forEach(item => {
        const namaItem = item.nama_barang || item.nama || 'Tanpa Nama';
        const div = document.createElement('div');
        div.className = 'item-pilihan';
        div.innerHTML = `
            <input type="radio" name="pilihanBarang" ${selectedItemData && selectedItemData.kode_barang === item.kode_barang ? 'checked' : ''}>
            <span>${namaItem}</span>
        `;
        
        div.addEventListener('click', function() {
            const radio = div.querySelector('input[type="radio"]');
            radio.checked = true;
            selectedItemData = item;
        });

        itemList.appendChild(div);
    });
}