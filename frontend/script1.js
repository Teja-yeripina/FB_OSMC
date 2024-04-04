async function showContent(contentType) {
    const contentContainer = document.getElementById('content-container');
    contentContainer.innerHTML = '';

    switch (contentType) {
        case 'users':
            await fetchAndDisplayUserData();
            break;
        case 'fevers':
            await fetchAndDisplayFeverData();
            break;
        case 'addFever':
            showAddFever();
            break;
        case 'deleteFever':
            showDeleteFeverForm();
            break;
        case 'logoutConfirmation':
            showLogoutConfirmation();
            break;
        default:
            break;
    }
}

async function fetchAndDisplayUserData() {
    try {
        const response = await fetch("/users");
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        const userData = await response.json();
        displayData(userData, 'Users');
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

async function fetchAndDisplayFeverData() {
    try {
        const response = await fetch("/fevers");
        if (!response.ok) {
            throw new Error('Failed to fetch fever data');
        }
        const feverData = await response.json();
        displayData(feverData, 'Fevers');
    } catch (error) {
        console.error('Error fetching fever data:', error);
    }
}

function displayData(data, contentType) {
    const contentContainer = document.getElementById('content-container');

    const header = document.createElement('h2');
    header.textContent = contentType;
    contentContainer.appendChild(header);

    if (data.length === 0) {
        const placeholder = document.createElement('div');
        placeholder.textContent = 'No data available';
        contentContainer.appendChild(placeholder);
        return;
    }

    const table = document.createElement('table');
    table.classList.add('user-table');

    const headerRow = table.insertRow();
    Object.keys(data[0]).forEach(key => {
        const headerCell = document.createElement('th');
        headerCell.textContent = key;
        headerRow.appendChild(headerCell);
    });

    data.forEach(item => {
        const row = table.insertRow();
        Object.values(item).forEach(value => {
            const cell = row.insertCell();
            cell.textContent = value;
        });
    });

    contentContainer.appendChild(table);
}

function showAddFever() {
    const contentContainer = document.getElementById('content-container');

    const addFeverDiv = document.createElement('div');
    addFeverDiv.id = 'addFever';
    addFeverDiv.innerHTML = `
        <h2>Add or Modify Fever</h2>
        <div class="content-placeholder" id="addFever-container">
            <label for="myfile">Select JSON file:</label>
            <input type="file" id="fileInput" accept=".json"> <!-- JSON file input --><br><br>
            <label for="myfile">Select Image file:</label>
            <input type="file" id="imageInput" accept="image/*"> <!-- Image file input -->
            <br><br>
            <button onclick="addFever()">Submit</button>
            <p id="message"></p>
        </div>
    `;
    contentContainer.appendChild(addFeverDiv);
}

function showDeleteFeverForm() {
    const contentContainer = document.getElementById('content-container');
    contentContainer.innerHTML = '';

    const deleteFeverForm = document.createElement('div');
    deleteFeverForm.id = 'deleteFeverForm';
    deleteFeverForm.innerHTML = `
        <h2>Delete Fever</h2>
        <div class="content-placeholder" id="deleteFever-container">
            <label for="feverId">Enter Fever ID:</label>
            <input type="text" id="feverId" name="feverId"><br><br>
            <button onclick="deleteFever()">Delete</button>
            <p id="message"></p>
        </div>
    `;
    contentContainer.appendChild(deleteFeverForm);
}

async function deleteFever() {
    const feverIdInput = document.getElementById('feverId');
    const feverId = feverIdInput.value;

    if (!feverId) {
        document.getElementById('message').textContent = 'Please enter a fever ID.';
        return;
    }

    const confirmed = confirm(`Are you sure you want to delete fever with ID ${feverId}?`);
    if (!confirmed) {
        return;
    }

    const url = `/deleteFever/${feverId}`;

    try {
        const response = await fetch(url, {
            method: 'DELETE',
        });

        if (response.ok) {
            document.getElementById('message').textContent = 'Fever deleted successfully.';
        } else {
            const errorMessage = await response.text();
            document.getElementById('message').textContent = errorMessage || 'Error deleting fever.';
        }
    } catch (error) {
        console.error('Error deleting fever:', error);
        document.getElementById('message').textContent = 'Error deleting fever.';
    }
}

function showLogoutConfirmation() {
    const contentContainer = document.getElementById('content-container');

    const logoutConfirmationDiv = document.createElement('div');
    logoutConfirmationDiv.id = 'logoutConfirmation';
    logoutConfirmationDiv.innerHTML = `
        <h2>Logout</h2>
        <p>Are you sure you want to logout?</p>
        <button onclick="logout()">YES</button>
        <button onclick="cancelLogout()">NO</button>
    `;
    contentContainer.appendChild(logoutConfirmationDiv);
}

async function addFever() {
    const fileInput = document.getElementById('fileInput');
    const imageInput = document.getElementById('imageInput');
    const messageElement = document.getElementById('message');

    const file = fileInput.files[0];
    const imageFile = imageInput.files[0];

    if (!file || !imageFile) {
        messageElement.textContent = 'Please select both a file and an image.';
        return;
    }

    const reader = new FileReader();

    reader.onload = async function(event) {
        try {
            const data = JSON.parse(event.target.result);
            data.imagePath = await loadImageData(imageFile);
            await sendDataToBackend(data);
        } catch (error) {
            messageElement.textContent = 'Error parsing JSON file.';
        }
    };

    reader.readAsText(file);
}

async function sendDataToBackend(data) {
    const url = '/addFever';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            document.getElementById('message').textContent = 'Fever added successfully.';
        } else {
            const errorMessage = await response.text(); // Get the error message from the response body
            document.getElementById('message').textContent = errorMessage || 'Error adding fever.';
        }
    } catch (error) {
        console.error('Error sending data to backend:', error);
        document.getElementById('message').textContent = 'Error sending data to backend.';
    }
}

async function loadImageData(imageFile) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(imageFile);
    });
}

function logout() {
    history.replaceState(null, '', window.location.href);
    window.location.href = '/ui_for_osmc.html';
}

function cancelLogout() {
    document.getElementById('logoutConfirmation').style.display = 'none';
}
