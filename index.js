const modal = document.querySelector('.modal');
const closeBtn = document.querySelector('.close');
const closeButton = document.querySelector('.button-cls');
const closeBtnFiler = document.querySelector('.close-filter ');
const filter = document.querySelector('.filter');
const pg = document.getElementById('pagination');

let students = [];
let currentEditingStudent = null;
let currentPage = 1;
const perPage = 10;

function addStudent(event) {
  event.preventDefault();
  // Lấy giá trị từ form
  let name = document.getElementById('name').value;
  let studentCode = document.getElementById('studentCode').value;
  let email = document.getElementById('email').value;
  let department = document.getElementById('department').value;
  let gender = document.getElementById('gender').value;
  let birthDate = document.getElementById('birthDate').value;

  // Tạo đối tượng sinh viên mới
  let newStudent = {
    name: name,
    studentCode: studentCode,
    email: email,
    department: department,
    gender: gender,
    birthDate: birthDate,
  };

  students.push(newStudent);
  document.getElementById('myForm').reset();
  renderStudentList();
  saveDataToSessionStorage()
  saveStudentsToLocalStorage();

}
document.getElementById('myForm').addEventListener('submit', addStudent);

// Hàm để render danh sách sinh viên vào HTML
let sortStates = ['asc', 'asc', 'asc', 'asc', 'asc', 'asc']

function renderStudentList() {
  let studentListDiv = document.getElementById('studentList');
  studentListDiv.innerHTML = '';

  let startIndex = (currentPage - 1) * perPage;
  let endIndex = startIndex + perPage;
  let currentStudents = students.slice(startIndex, endIndex);

  // Tạo một bảng để hiển thị danh sách sinh viên
  let table = document.createElement('table');
  let headerRow = table.insertRow();
  let headers = ['Name', 'Student Code', 'Email', 'Department', 'Gender', 'Birth Date', 'Action'];

  // Tạo header của bảng với nút sắp xếp
  headers.forEach(function (headerText, index) {
    let header = document.createElement('th');
    header.textContent = headerText;

    if (index < headers.length - 1) {
      let sortButton = document.createElement('button');
      sortButton.textContent = "\u2195";
      sortButton.classList.add('sort-button');
      sortButton.addEventListener('click', function () {
        sortColumn(index);
        updateSortButtons(index);
      });
      header.appendChild(sortButton);
    }
    headerRow.appendChild(header);
  });

  // Thêm các sinh viên vào bảng
  currentStudents.forEach(function (student) {
    let row = table.insertRow();
    Object.keys(student).forEach(function (key) {
      let cell = row.insertCell();
      cell.textContent = student[key];
    });
    // Tạo nút Edit
    let editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.classList.add('edit-button');
    editButton.addEventListener('click', function () {
      // Điền dữ liệu của hàng vào modal form
      document.getElementById('editName').value = student.name;
      document.getElementById('editStudentCode').value = student.studentCode;
      document.getElementById('editEmail').value = student.email;
      document.getElementById('editDepartment').value = student.department;
      document.getElementById('editGender').value = student.gender;
      document.getElementById('editBirthDate').value = student.birthDate;

      currentEditingStudent = student;
      // Hiển thị modal
      modal.style.display = "block";
    });
    // Tạo nút Remove
    let removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.classList.add('remove-button');
    removeButton.addEventListener('click', function () {
      showConfirmModal(student);
    });
    let actionCell = row.insertCell();
    actionCell.appendChild(editButton);
    actionCell.appendChild(removeButton);
  });
  studentListDiv.appendChild(table);
  renderPagination();
}

function sortColumn(index) {
  students.sort(function (a, b) {
    let keyA = Object.values(a)[index];
    let keyB = Object.values(b)[index];

    if (index === 5) {
      keyA = new Date(keyA);
      keyB = new Date(keyB);
    }

    if (sortStates[index] === 'asc') {
      return keyA < keyB ? -1 : keyA > keyB ? 1 : 0;
    } else {
      return keyA > keyB ? -1 : keyA < keyB ? 1 : 0;
    }
  });
  renderStudentList();
}

function updateSortButtons(index) {
  // Cập nhật biểu tượng của các nút sắp xếp
  let sortButtons = document.querySelectorAll('.sort-button');
  sortButtons.forEach(function (button, buttonIndex) {
    if (buttonIndex === index) {
      if (sortStates[index] === 'none' || sortStates[index] === 'desc') {
        button.textContent = "\u2193";
        sortStates[index] = 'asc';
      } else {
        button.textContent = "\u2191";
        sortStates[index] = 'desc';
      }
    } else {
      button.textContent = "\u2195";
      sortStates[buttonIndex] = 'none';
    }
  });
}

// Hàm để render thanh phân trang
function renderPagination() {
  let totalPages = Math.ceil(students.length / perPage);
  pg.innerHTML = '';

  // Tạo nút Previous
  let prevButton = document.createElement('button');
  prevButton.textContent = '<<';
  prevButton.disabled = currentPage === 1;
  prevButton.classList.add('pagination-button');
  prevButton.addEventListener('click', function () {
    if (currentPage > 1) {
      currentPage--;
      renderStudentList();
      renderPagination();
    }
  });
  pg.appendChild(prevButton);

  // Hiển thị các nút số trang
  if (totalPages <= 3) {
    for (let i = 1; i <= totalPages; i++) {
      appendPageButton(i);
    }
  } else {
    if (currentPage <= 2) {
      for (let i = 1; i <= 3; i++) {
        appendPageButton(i);
      }
      appendEllipsis();
      appendPageButton(totalPages);
    } else if (currentPage >= totalPages - 1) {
      appendPageButton(1);
      appendEllipsis();
      for (let i = totalPages - 2; i <= totalPages; i++) {
        appendPageButton(i);
      }
    } else {
      appendPageButton(1);
      appendEllipsis();
      for (let i = currentPage; i <= currentPage; i++) {
        appendPageButton(i);
      }
      appendEllipsis();
      appendPageButton(totalPages);
    }
  }
  // Tạo nút Next
  let nextButton = document.createElement('button');
  nextButton.textContent = '>>';
  nextButton.disabled = currentPage === totalPages;
  nextButton.classList.add('pagination-button');
  nextButton.addEventListener('click', function () {
    if (currentPage < totalPages) {
      currentPage++;
      renderStudentList();
      renderPagination();
    }
  });
  pg.appendChild(nextButton);

  // Hàm thêm nút số trang
  function appendPageButton(page) {
    let pageNumberButton = document.createElement('button');
    pageNumberButton.textContent = page;
    pageNumberButton.classList.add('pagination-button');
    if (currentPage === page) {
      pageNumberButton.classList.add('active');
    }
    pageNumberButton.addEventListener('click', function () {
      currentPage = page;
      renderStudentList();
      renderPagination();
    });
    pg.appendChild(pageNumberButton);
  }

  function appendEllipsis() {
    let ellipsis = document.createElement('span');
    ellipsis.textContent = '...';
    pg.appendChild(ellipsis);
  }
}

closeBtn.onclick = function () {
  modal.style.display = "none";
}

// Xử lý khi nhấn Update trên modal form để cập nhật sinh viên
function updateStudent() {
  // Lấy dữ liệu từ các trường input trong modal
  let editedName = document.getElementById('editName').value;
  let editedStudentCode = document.getElementById('editStudentCode').value;
  let editedEmail = document.getElementById('editEmail').value;
  let editedDepartment = document.getElementById('editDepartment').value;
  let editedGender = document.getElementById('editGender').value;
  let editedBirthDate = document.getElementById('editBirthDate').value;

  // Cập nhật thông tin của sinh viên đang chỉnh sửa
  currentEditingStudent.name = editedName;
  currentEditingStudent.studentCode = editedStudentCode;
  currentEditingStudent.email = editedEmail;
  currentEditingStudent.department = editedDepartment;
  currentEditingStudent.gender = editedGender;
  currentEditingStudent.birthDate = editedBirthDate;

  renderStudentList();
  saveDataToSessionStorage();
  saveStudentsToLocalStorage();



  modal.style.display = "none";
}

// Hàm xóa sinh viên
function deleteStudent(student) {
  let index = students.findIndex(s => s === student);

  if (index !== -1) {
    students.splice(index, 1);
    renderStudentList();
    saveDataToSessionStorage()
  } else {
    console.error('Student not found');
  }
}

// Function to show confirm modal
function showConfirmModal(student) {
  let confirmModal = document.getElementById('confirmModal');
  let confirmStudentName = document.getElementById('confirmStudentName');
  confirmStudentName.textContent = student.name;

  confirmModal.style.display = 'block';

  // Close modal when click on 'x' button
  let closeButton = document.querySelector('.btn_close_del');
  closeButton.onclick = function () {
    confirmModal.style.display = 'none';
  };


  // Handle Cancel button click
  let cancelButton = document.getElementById('cancelButton');
  cancelButton.onclick = function () {
    confirmModal.style.display = 'none';
  };

  // Handle Delete button click
  let deleteButton = document.getElementById('deleteButton');
  deleteButton.onclick = function () {
    deleteStudent(student);
    confirmModal.style.display = 'none';
  };
}

// Hàm tìm kiếm sinh viên
function searchStudent() {
  // Lấy giá trị từ ô nhập liệu

  let searchText = document.getElementById('searchInput').value.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .trim();

  // Tạo mảng mới để lưu kết quả tìm kiếm
  let searchResults = students.filter(student =>
    student.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(searchText)
  );

  // Render danh sách sinh viên tìm được
  renderFilteredStudentList(searchResults);
}

// Hàm để render danh sách sinh viên tìm được
function renderFilteredStudentList(results) {
  let studentListDiv = document.getElementById('studentList');
  studentListDiv.innerHTML = '';

  if (results.length === 0) {
    studentListDiv.innerHTML = '<p>No matching students found.</p>';
    return;
  }

  // Tạo bảng để hiển thị kết quả tìm kiếm
  let table = document.createElement('table');
  let headerRow = table.insertRow();
  let headers = ['Name', 'Student Code', 'Email', 'Department', 'Gender', 'Birth Date', 'Action'];

  // Tạo header của bảng
  headers.forEach(function (headerText) {
    let header = document.createElement('th');
    header.textContent = headerText;
    headerRow.appendChild(header);
  });

  // Thêm các sinh viên vào bảng
  results.forEach(function (student) {
    let row = table.insertRow();
    Object.keys(student).forEach(function (key) {
      let cell = row.insertCell();
      cell.textContent = student[key];
    });

    // Tạo nút Edit
    let editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.classList.add('edit-button');
    editButton.addEventListener('click', function () {
      currentEditingStudent = student;
      document.getElementById('editName').value = student.name;
      document.getElementById('editStudentCode').value = student.studentCode;
      document.getElementById('editEmail').value = student.email;
      document.getElementById('editDepartment').value = student.department;
      document.getElementById('editGender').value = student.gender;
      document.getElementById('editBirthDate').value = student.birthDate;
      modal.style.display = "block";
    });

    // Tạo nút Remove
    let removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.classList.add('remove-button');
    removeButton.addEventListener('click', function () {
      showConfirmModal(student);
    });

    let actionCell = row.insertCell();
    actionCell.appendChild(editButton);
    actionCell.appendChild(removeButton);
  });

  studentListDiv.appendChild(table);
}

function clearInput() {
  searchInput.value = '';
  closeButton.style.display = 'none';
  renderStudentList();
}

function displayFilterForm() {
  filter.style.display = "block";
}
closeBtnFiler.onclick = function () {
  filter.style.display = "none";
}
function normalizeString(str) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}
// Function to filter students
function filterStudents() {
  let filterName = normalizeString(document.getElementById('filterName').value);
  let filterStudentCode = document.getElementById('filterStudentCode').value;
  let filterEmail = document.getElementById('filterEmail').value;
  let filterDepartment = document.getElementById('filterDepartment').value;
  let filterGender = document.getElementById('filterGender').value;
  let filterBirthDate = document.getElementById('filterBirthDate').value;

  let filteredStudents = students.filter(student => {
    let studentName = normalizeString(student.name);
    if (filterName && !studentName.includes(filterName)) {
      return false;
    }
    if (filterStudentCode && student.studentCode !== filterStudentCode) {
      return false;
    }
    if (filterEmail && student.email !== filterEmail) {
      return false;
    }
    if (filterDepartment !== 'All' && student.department !== filterDepartment) {
      return false;
    }
    if (filterGender !== 'All' && student.gender !== filterGender) {
      return false;
    }
    if (filterBirthDate && student.birthDate !== filterBirthDate) {
      return false;
    }
    return true;
  });
  renderFilteredStudentList(filteredStudents);
}

// Function to reset filter
function resetFilter() {
  document.getElementById('filterName').value = '';
  document.getElementById('filterStudentCode').value = '';
  document.getElementById('filterEmail').value = '';
  document.getElementById('filterDepartment').value = 'All';
  document.getElementById('filterGender').value = 'All';
  document.getElementById('filterBirthDate').value = '';

  renderStudentList();
}

function saveDataToSessionStorage() {
  sessionStorage.setItem('studentsData', JSON.stringify(students));
}

// function saveStudentsToLocalStorage() {
//   localStorage.setItem('students', JSON.stringify(students));
// }


