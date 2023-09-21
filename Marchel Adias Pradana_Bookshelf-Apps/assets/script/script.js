const books = [];
const RENDER_EVENT = 'render-book';

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

function addBook() {
    const bookTitle = document.getElementById('inputBookTitle').value;
    const bookAuthor = document.getElementById('inputBookAuthor').value;
    const bookYear = document.getElementById('inputBookYear').value;
    const hasBeenRead = document.getElementById('inputBookIsComplete').checked;

    const generateID = +new Date();

    const bookObject = generateBookObject(generateID, bookTitle, bookAuthor, bookYear, hasBeenRead);
    books.push(bookObject);

    alert('Data buku berhasil ditambahkan');
    document.getElementById('inputBookTitle').value = '';
    document.getElementById('inputBookAuthor').value = '';
    document.getElementById('inputBookYear').value = '';
    document.getElementById('inputBookIsComplete').checked = false;

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateBookObject(id, title, author, year, hasBeenRead) {
    return {
        id,
        title,
        author,
        year: parseInt(year),
        hasBeenRead,
    }
}

document.addEventListener(RENDER_EVENT, function () {
    const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
    incompleteBookshelfList.innerHTML = '';

    const completeBookshelfList = document.getElementById('completeBookshelfList');
    completeBookshelfList.innerHTML = '';

    const unreadCount = books.filter(book => !book.hasBeenRead).length;
    const readCount = books.filter(book => book.hasBeenRead).length;

    const unreadBookCountElement = document.getElementById('unreadBookCount');
    const readBookCountElement = document.getElementById('readBookCount');

    unreadBookCountElement.textContent = unreadCount;
    readBookCountElement.textContent = readCount;

    for (const listItem of books) {
        const bookElement = makeBookList(listItem);

        if (!listItem.hasBeenRead) {
            incompleteBookshelfList.append(bookElement);
        } else {
            completeBookshelfList.append(bookElement);
        }
    }
});

function makeBookList(bookObject) {
    const bookTitle = document.createElement('h3');
    bookTitle.innerText = bookObject.title;

    const bookAuthor = document.createElement('p');
    bookAuthor.innerText = `Penulis : ${bookObject.author}`;

    const bookYear = document.createElement('p');
    bookYear.innerText = `Tahun : ${bookObject.year}`;

    const container = document.createElement('div');
    container.classList.add('container-book');
    container.append(bookTitle, bookAuthor, bookYear);
    container.setAttribute('id', `book-${bookObject.id}`);

    if (bookObject.hasBeenRead) {
        const undoButton = document.createElement('button');
        undoButton.classList.add('green');
        undoButton.innerText = 'Belum selesai dibaca';

        undoButton.addEventListener('click', function () {
            addBookToIncompleted(bookObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('red');
        trashButton.innerText = 'Hapus buku';

        trashButton.addEventListener('click', function () {
            removeBook(bookObject.id);
        });

        const editButton = document.createElement('button');
        editButton.classList.add('blue');
        editButton.innerText = 'Edit buku';

        editButton.addEventListener('click', function () {
            editBookData(bookObject.id);
        });

        container.append(undoButton, trashButton, editButton);
    } else {
        const undoButton = document.createElement('button');
        undoButton.classList.add('green');
        undoButton.innerText = 'Selesai dibaca';

        undoButton.addEventListener('click', function () {
            addBookToCompleted(bookObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('red');
        trashButton.innerText = 'Hapus buku';

        trashButton.addEventListener('click', function () {
            removeBook(bookObject.id);
        });

        const editButton = document.createElement('button');
        editButton.classList.add('blue');
        editButton.innerText = 'Edit buku';

        editButton.addEventListener('click', function () {
            editBookData(bookObject.id);
        });

        container.append(undoButton, trashButton, editButton);
    }

    return container;
}

function addBookToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    if (confirm('Apakah Anda yakin untuk memindahkan buku ke daftar "Selesai dibaca" ?')) {
        bookTarget.hasBeenRead = true;
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }
}

function addBookToIncompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    if (confirm('Apakah Anda yakin untuk memindahkan buku ke daftar "belum selesai dibaca" ?')) {
        bookTarget.hasBeenRead = false;
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }
}

function findBook(bookId) {
    for (const listItem of books) {
        if (listItem.id === bookId) {
            return listItem;
        }
    }
    return null;
}

function editBookData(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    if (confirm('Apakah Anda yakin ingin mengedit data buku?')) {
        editingBookId = bookId;

        alert('Silahkan edit data pada form edit buku');
        const editForm = document.querySelector('.edit');
        editForm.removeAttribute('hidden');

        document.getElementById('editBookTitle').value = bookTarget.title;
        document.getElementById('editBookAuthor').value = bookTarget.author;
        document.getElementById('editBookYear').value = bookTarget.year;
        document.getElementById('editBookIsComplete').checked = bookTarget.hasBeenRead;

        const editBookForm = document.getElementById('editBook');
        editBookForm.removeEventListener('submit', editBook);

        editBookForm.addEventListener('submit', function (event) {
            event.preventDefault();

            saveData();
            editForm.setAttribute('hidden', 'true');
            editingBookId = null;

            document.dispatchEvent(new Event(RENDER_EVENT));

            alert('Data buku berhasil diubah');
        });
    }
}


function removeBook(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    if (confirm('Apakah Anda yakin ingin menghapus data buku lama dalam daftar ?')) {
        books.splice(bookTarget, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK-APPS';

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));

        if (editingBookId !== null) {
            const editedBook = findBook(editingBookId);

            if (editedBook !== null) {
                editedBook.title = document.getElementById('editBookTitle').value;
                editedBook.author = document.getElementById('editBookAuthor').value;
                editedBook.year = document.getElementById('editBookYear').value;
                editedBook.hasBeenRead = document.getElementById('editBookIsComplete').checked;

                editingBookId = null;
            }
        }
    }
}

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser Anda tidak mendukung local storatge');
        return false;
    }
    return true;
}

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

const searchBookForm = document.getElementById('searchBook');
const searchBookTitle = document.getElementById('searchBookTitle');

searchBookForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const searchBook = searchBookTitle.value.trim().toLowerCase();
    const bookList = document.querySelectorAll('.container-book');

    const matchingBooks = books.filter(book =>
    (searchBook === '' ||
        book.title.toLowerCase().includes(searchBook) ||
        book.author.toLowerCase().includes(searchBook) ||
        book.year.toString().includes(searchBook))
    );

    const unreadCount = matchingBooks.filter(book => !book.hasBeenRead).length;
    const readCount = matchingBooks.filter(book => book.hasBeenRead).length;

    const unreadBookCountElement = document.getElementById('unreadBookCount');
    const readBookCountElement = document.getElementById('readBookCount');

    unreadBookCountElement.textContent = unreadCount.toString();
    readBookCountElement.textContent = readCount.toString();

    for (const book of bookList) {
        const searchBookbyTitle = book.querySelector('h3').innerText.toLowerCase();
        const searchBookbyDetail = book.querySelector('p').innerText.toLowerCase();

        if (searchBook !== 'penulis' &&
            (searchBookbyTitle.includes(searchBook) || searchBookbyDetail.includes(searchBook))) {
            book.style.display = 'block';
        } else {
            book.style.display = 'none';
        }
    }
});