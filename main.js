const toggleButton = document.getElementById('toggleForm');
const form = document.getElementById('infoForm');
const clientList = document.getElementById('clientList');

// Function to set the initial state of the toggle button and add event listener
function setInitialToggleButtonState() {
    if (form.style.display === 'none' || form.style.display === '') {
        toggleButton.innerHTML = '<span class="arrow-down">&#9660;</span>'; 
    } else {
        toggleButton.innerHTML = '<span class="arrow-up">&#9650;</span>'; 
    }

    // Add event listener to the toggle button
    toggleButton.addEventListener('click', () => {
        if (form.style.display === 'none' || form.style.display === '') {
            form.style.display = 'flex';
            form.style.columnGap = '20px'
            form.style.flexWrap = 'wrap'
            form.style.justifyContent = 'center';
            toggleButton.innerHTML = '<span class="arrow-up">&#9650;</span>';
        } else {
            form.style.display = 'none';
            toggleButton.innerHTML = '<span class="arrow-down">&#9660;</span>'; 
        }
    });
}

// Call the function to set the initial state and add event listener when the page loads
setInitialToggleButtonState();

document.getElementById('save').addEventListener('click', () => {
    const clientInfo = {
        clientKey: document.getElementById('clientKey').value,
        clientShort: document.getElementById('clientShort').value,
        corpUser: document.getElementById('corpUser').value,
        corpSHGS: document.getElementById('CorpSHGS').value,
        cluster: document.getElementById('cluster').value,
        corpGroup: document.getElementById('corpGroup').value,
        team: document.getElementById('team').value,
        codeInn: document.getElementById('codeInn').value,
        representative: document.getElementById('representative').value,
        position: document.getElementById('position').value,
        birthday: document.getElementById('birthday').value,
        city: document.getElementById('city').value,
        address: document.getElementById('address').value,
        phone1: document.getElementById('phone1').value,
        email: document.getElementById('mail').value,
        language: document.getElementById('language').value,
        gender: document.getElementById('gender').value,
        personalID: document.getElementById('personalID').value,
        status: document.getElementById('status').value,
        giftCategory: document.getElementById('giftCategory').value,
        essential: document.getElementById('essential').value
    };

    saveClientInfo(clientInfo);
    renderClientList();
    form.reset();
});

function saveClientInfo(clientInfo) {
    // Check if any of the input fields are empty
    let isEmpty = false;
    const inputs = document.querySelectorAll('#infoForm input');
    inputs.forEach(input => {
        if (!input.value.trim()&& input.id !== 'phone2') {
            isEmpty = true;
            input.classList.add('empty-field'); 
        } else {
            input.classList.remove('empty-field'); 
        }
    });

    if (isEmpty) {
        return; 
    }

    const existingClients = Object.values(localStorage).map(client => JSON.parse(client));
    const isExisting = existingClients.some(existingClient => {
        return existingClient.clientKey === clientInfo.clientKey &&
            existingClient.clientShort === clientInfo.clientShort &&
            existingClient.corpUser === clientInfo.corpUser &&
            existingClient.corpSHGS === clientInfo.corpSHGS &&
            existingClient.cluster === clientInfo.cluster &&
            existingClient.corpGroup === clientInfo.corpGroup &&
            existingClient.team === clientInfo.team &&
            existingClient.codeInn === clientInfo.codeInn &&
            existingClient.representative === clientInfo.representative &&
            existingClient.position === clientInfo.position &&
            existingClient.birthday === clientInfo.birthday &&
            existingClient.city === clientInfo.city &&
            existingClient.address === clientInfo.address &&
            existingClient.team === clientInfo.team &&
            existingClient.codeInn === clientInfo.codeInn &&
            existingClient.representative === clientInfo.representative &&
            existingClient.phone1 === clientInfo.phone1 &&
            existingClient.phone2 === clientInfo.phone2 &&
            existingClient.email === clientInfo.email &&
            existingClient.language === clientInfo.language &&
            existingClient.gender === clientInfo.gender &&
            existingClient.personalID === clientInfo.personalID &&
            existingClient.status === clientInfo.status &&
            existingClient.giftCategory === clientInfo.giftCategory &&
            existingClient.essential === clientInfo.essential &&
            existingClient.city === clientInfo.city;
    });

    if (isExisting) {
        alert('This client already exists!');
        return; 
    }

    localStorage.setItem(Date.now(), JSON.stringify(clientInfo));
}
renderClientList();

function renderClientList() {
    clientList.innerHTML = '';
    const today = new Date();
    const todayWithoutYear = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Get all clients from localStorage
    const clients = Object.keys(localStorage).map(key => {
        return { key: key, clientInfo: JSON.parse(localStorage.getItem(key)) };
    });

    // Sort clients by birthday proximity
    clients.sort((a, b) => {
        const aBirthday = new Date(today.getFullYear(), new Date(a.clientInfo.birthday).getMonth(), new Date(a.clientInfo.birthday).getDate());
        const bBirthday = new Date(today.getFullYear(), new Date(b.clientInfo.birthday).getMonth(), new Date(b.clientInfo.birthday).getDate());
        const aTimeDiff = Math.abs(aBirthday - todayWithoutYear);
        const bTimeDiff = Math.abs(bBirthday - todayWithoutYear);
        return aTimeDiff - bTimeDiff;
    });

    const todayBirthdayClients = [];
    const next30DaysClients = [];
    const otherClients = [];

    // Divide clients into three sections based on birthday proximity
    clients.forEach(({ key, clientInfo }) => {
        const clientBirthday = new Date(clientInfo.birthday);
        const clientBirthdayWithoutYear = new Date(today.getFullYear(), clientBirthday.getMonth(), clientBirthday.getDate());
        const timeDiff = Math.abs(clientBirthdayWithoutYear - todayWithoutYear);
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        if (daysDiff === 0) {
            todayBirthdayClients.push({ key, clientInfo });
        } else if (daysDiff <= 30) { // Check if the birthday is within the next 30 days
            if (clientBirthdayWithoutYear >= todayWithoutYear) {
                next30DaysClients.push({ key, clientInfo });
            } else {
                otherClients.push({ key, clientInfo }); // Birthday has already passed within the next 30 days
            }
        } else {
            otherClients.push({ key, clientInfo });
        }
    });

    // Render clients with today's birthday
    renderClientSection(todayBirthdayClients, "Today's birthdays", true);

    // Render clients with birthdays in the next 30 days
    renderClientSection(next30DaysClients, 'Birthdays for the next 30 days', false);

    // Render other clients
    renderClientSection(otherClients, 'All birthdays', false);
}

function renderClientSection(clients, sectionHeader, isMinimized) {
    const sectionDiv = document.createElement('div');
    sectionDiv.classList.add('client-section');

    const headerDiv = document.createElement('div');
    headerDiv.classList.add('section-header');

    const header = document.createElement('h2');
    header.textContent = sectionHeader;

    const toggleButton = document.createElement('button');
    toggleButton.textContent = isMinimized ? '⯅' : '⯆'; // Set the toggle button icon based on whether the section should be maximized or minimized
    toggleButton.addEventListener('click', () => {
        const clientContainerDiv = sectionDiv.querySelector('.client-container');
        if (clientContainerDiv.classList.contains('minimized')) {
            clientContainerDiv.classList.remove('minimized');
            toggleButton.textContent = '⯅'; // Change icon to minimize
        } else {
            clientContainerDiv.classList.add('minimized');
            toggleButton.textContent = '⯆'; // Change icon to maximize
        }
    });

    headerDiv.appendChild(header);
    headerDiv.appendChild(toggleButton);

    sectionDiv.appendChild(headerDiv);

    const clientContainerDiv = document.createElement('div');
    clientContainerDiv.classList.add('client-container');

    clients.forEach(({ key, clientInfo }) => {
        const clientDiv = createClientDiv(clientInfo, key);
        clientContainerDiv.appendChild(clientDiv);
    });

    sectionDiv.appendChild(clientContainerDiv);
    clientList.appendChild(sectionDiv);

    // Set the section to be maximized or minimized based on the isMaximized parameter
    if (!isMinimized) {
        clientContainerDiv.classList.add('minimized');
    }
}


function createClientDiv(clientInfo, key) {
    const clientDiv = document.createElement('div');
    clientDiv.classList.add('client');
    clientDiv.id = key;

    const clientInfoDiv = document.createElement('div');
    clientInfoDiv.classList.add('client-info');

    const representativeDiv = document.createElement('div');
    representativeDiv.textContent = clientInfo.representative;

    const positionDiv = document.createElement('div');
    positionDiv.textContent = clientInfo.position;

    clientInfoDiv.appendChild(representativeDiv);
    clientInfoDiv.appendChild(positionDiv);

    const infoButton = document.createElement('button');
    infoButton.textContent = 'Info';
    infoButton.addEventListener('click', () => {
        showDetailedInfo(key);
    });

    clientDiv.appendChild(clientInfoDiv);
    clientDiv.appendChild(infoButton);

    return clientDiv;
}



function showDetailedInfo(key) {
    const clientInfo = JSON.parse(localStorage.getItem(key));

    // Create a modal container
    const modalContainer = document.createElement('div');
    modalContainer.classList.add('modal-container');

    // Create a modal content
    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');

    // Construct the HTML content for detailed client information
    const formattedBirthday = formatBirthday(clientInfo.birthday);
    const content = `
        <h2>Client info</h2>
        <p><strong>Client key:</strong> ${clientInfo.clientKey}</p>
        <p><strong>Client Short:</strong> ${clientInfo.clientShort}</p>
        <p><strong>Corp User:</strong> ${clientInfo.corpUser}</p>
        <p><strong>CorpSHGS:</strong> ${clientInfo.corpSHGS}</p>
        <p><strong>Cluster:</strong> ${clientInfo.cluster}</p>
        <p><strong>Corp Group:</strong> ${clientInfo.corpGroup}</p>
        <p><strong>Team:</strong> ${clientInfo.team}</p>
        <p><strong>Code INN:</strong> ${clientInfo.codeInn}</p>
        <p><strong>Representative:</strong> ${clientInfo.representative}</p>
        <p><strong>Position:</strong> ${clientInfo.position}</p>
        <p><strong>Birthday:</strong> ${formattedBirthday}</p> <!-- Display formatted birthday -->
        <p><strong>City:</strong> ${clientInfo.city}</p>
        <p><strong>Address:</strong> ${clientInfo.address}</p>
        <p><strong>Phone 1:</strong> ${clientInfo.phone1}</p>
        <p><strong>Phone 2:</strong> ${clientInfo.phone2}</p>
        <p><strong>E-mail:</strong> ${clientInfo.email}</p>
        <p><strong>Language:</strong> ${clientInfo.language}</p>
        <p><strong>Gender:</strong> ${clientInfo.gender}</p>
        <p><strong>Personal ID:</strong> ${clientInfo.personalID}</p>
        <p><strong>Status:</strong> ${clientInfo.status}</p>
        <p><strong>Gift Category:</strong> ${clientInfo.giftCategory}</p>
        <p><strong>Essential:</strong> ${clientInfo.essential}</p>
        <!-- Add more detailed client information here -->
        <div class:'edit_delete'>
            <button id="editButton">Edit</button>
            <button id="deleteButton">Delete</button>
        </div>
    `;

    // Add content to the modal content
    modalContent.innerHTML = content;

    // Append the modal content to the modal container
    modalContainer.appendChild(modalContent);

    // Append the modal container to the body
    document.body.appendChild(modalContainer);

    // Add event listener to close the modal on background click
    modalContainer.addEventListener('click', closeModal);

    // Function to close the modal
    function closeModal(event) {
        if (event.target === modalContainer) {
            document.body.removeChild(modalContainer);
        }
    }

    // Add event listener for edit button
    const editButton = document.getElementById('editButton');
    editButton.addEventListener('click', () => {
        editClientInfo(clientInfo, key);
    });

    // Add event listener for delete button
    const deleteButton = document.getElementById('deleteButton');
    deleteButton.addEventListener('click', () => {
        deleteClient(key);
        document.body.removeChild(modalContainer);
        removeClientFromView(key); // Remove client from view after deletion
    });
}

// Function to format the birthday
function formatBirthday(birthday) {
    const birthdayDate = new Date(birthday);
    const day = birthdayDate.getDate().toString().padStart(2, '0'); 
    const monthAbbreviations = [
        'იან', 'თებ', 'მარ', 'აპრ', 'მაი', 'ივნ',
        'ივლ', 'აგვ', 'სექ', 'ოქტ', 'ნოე', 'დეკ'
    ];
    const monthIndex = birthdayDate.getMonth();
    const georgianMonth = monthAbbreviations[monthIndex];
    const year = birthdayDate.getFullYear();
    return `${day}-${georgianMonth}-${year}`;
}

function editClientInfo(clientInfo, key) {
    // Create a modal content
    const modalContent = document.querySelector('.modal-content');

    // Clear existing content
    modalContent.innerHTML = '';

    // Create select elements for specific client info properties
    function createSelect(id, name, options, required) {
        const selectContainer = document.createElement('div');
        selectContainer.classList.add('select-container');

        const label = document.createElement('label');
        label.textContent = name.charAt(0).toUpperCase() + name.slice(1); 
        label.setAttribute('for', id);

        const select = document.createElement('select');
        select.id = id;
        select.name = name;
        select.required = required;

        options.forEach(optionText => {
            const option = document.createElement('option');
            option.value = optionText.toLowerCase();
            option.textContent = optionText;
            if (clientInfo[name] && clientInfo[name].toLowerCase() === optionText.toLowerCase()) {
                option.selected = true; 
            }
            select.appendChild(option);
        });

        selectContainer.appendChild(label);
        selectContainer.appendChild(select);

        return selectContainer;
    }

    // Create select elements
    const languageSelect = createSelect('language', 'language', ['Select a language', 'Georgian', 'English', 'Spanish', 'French'], true);
    const genderSelect = createSelect('gender', 'gender', ['Select a Gender', 'Male', 'Famale'], true);
    const statusSelect = createSelect('status', 'status', ['Select a Status', 'Express', 'Gold', 'RB', 'Retail', 'Silver', 'SOLO', 'SOLO Club', 'SOLO Core', 'WM'], true);
    const giftCategorySelect = createSelect('giftCategory', 'giftCategory', ['Select a Category', '1', '2', '3'], true);
    const essentialSelect = createSelect('essential', 'essential', ['Select', 'Yes', 'No'], true);

    // Append select elements to form
    modalContent.appendChild(languageSelect);
    modalContent.appendChild(genderSelect);
    modalContent.appendChild(statusSelect);
    modalContent.appendChild(giftCategorySelect);
    modalContent.appendChild(essentialSelect);

    // Loop through each input field definition and create corresponding input elements
    Object.keys(clientInfo).forEach(fieldName => {
        if (fieldName !== 'language' && fieldName !== 'gender' && fieldName !== 'status' && fieldName !== 'giftCategory' && fieldName !== 'essential') {
            const inputDiv = document.createElement('div');
            inputDiv.classList.add('input-field');

            const label = document.createElement('label');
            label.textContent = `${fieldName}: `;
            label.setAttribute('for', fieldName);
            inputDiv.appendChild(label);

            let inputField;

            if (fieldName === 'birthday') {
                inputField = document.createElement('input');
                inputField.type = 'date';

                // Format date as "YYYY-MM-DD"
                const formattedDate = clientInfo[fieldName].split('/').reverse().join('-'); // Assuming the date format is DD/MM/YYYY

                inputField.value = formattedDate;
                inputField.id = fieldName;
                inputField.name = fieldName;
            } else {
                inputField = document.createElement('input');
                inputField.type = 'text';
                inputField.id = fieldName;
                inputField.name = fieldName;
                inputField.value = clientInfo[fieldName];
            }

            inputDiv.appendChild(inputField);

            modalContent.appendChild(inputDiv);
        }
    });

    // Add event listener to save button
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.addEventListener('click', () => {
        // Check if any changes were made
        let hasChanges = false;
        const inputs = document.querySelectorAll('.modal-content input, .modal-content select');
        const editedClientInfo = {};

        inputs.forEach(input => {
            const fieldName = input.id;
            const currentValue = input.value.trim();
            const originalValue = clientInfo[fieldName];

            // If the current value is different from the original value, there are changes
            if (currentValue !== originalValue) {
                hasChanges = true;
                editedClientInfo[fieldName] = currentValue; // Save changed value
            } else {
                editedClientInfo[fieldName] = originalValue; // Save original value
            }
        });

        // If no changes were made, return without saving or updating modal content
        if (!hasChanges) {
            return;
        }

        // Validate all input fields
        let isEmpty = false;
        inputs.forEach(input => {
            if (input.required && !input.value.trim()) {
                isEmpty = true;
                input.classList.add('empty-field'); // Add a class to empty fields
            } else {
                input.classList.remove('empty-field'); // Remove the class from non-empty fields
            }
        });

        // If any field is empty, display an alert message and return without saving
        if (isEmpty) {
            alert('Please fill out all required fields.');
            return;
        }

        // Save the edited client info
        localStorage.setItem(key, JSON.stringify(editedClientInfo));

        // Update the modal content with the updated client information
        updateModalContent(editedClientInfo, key);

        // Update the corresponding client div in the client list
        updateClientInView(key, editedClientInfo);
    });

    // Append the save button to the form
    modalContent.appendChild(saveButton);
}

function updateClientInView(key, editedClientInfo) {
    const clientDiv = document.getElementById(key);
    if (clientDiv) {
        const clientInfoContainer = clientDiv.querySelector('.inf');
        if (clientInfoContainer) {
            Object.keys(editedClientInfo).forEach(fieldName => {
                const fieldElement = clientInfoContainer.querySelector(`[data-field="${fieldName}"]`);
                if (fieldElement) {
                    fieldElement.textContent = editedClientInfo[fieldName];
                }
            });
        }
    }
}

// Function to update modal content after saving changes
function updateModalContent(editedClientInfo, key) {
    const modalContent = document.querySelector('.modal-content');
    
    // Clear existing content
    modalContent.innerHTML = '';

    // Construct the HTML content for detailed client information
    const formattedBirthday = formatBirthday(editedClientInfo.birthday);
    const content = `
        <h2>Client info</h2>
        <p><strong>Client key:</strong> ${editedClientInfo.clientKey}</p>
        <p><strong>Client Short:</strong> ${editedClientInfo.clientShort}</p>
        <p><strong>Corp User:</strong> ${editedClientInfo.corpUser}</p>
        <p><strong>CorpSHGS:</strong> ${editedClientInfo.corpSHGS}</p>
        <p><strong>Cluster:</strong> ${editedClientInfo.cluster}</p>
        <p><strong>Corp Group:</strong> ${editedClientInfo.corpGroup}</p>
        <p><strong>Team:</strong> ${editedClientInfo.team}</p>
        <p><strong>Code INN:</strong> ${editedClientInfo.codeInn}</p>
        <p><strong>Representative:</strong> ${editedClientInfo.representative}</p>
        <p><strong>Position:</strong> ${editedClientInfo.position}</p>
        <p><strong>Birthday:</strong> ${formattedBirthday}</p> <!-- Display formatted birthday -->
        <p><strong>City:</strong> ${editedClientInfo.city}</p>
        <p><strong>Address:</strong> ${editedClientInfo.address}</p>
        <p><strong>Phone 1:</strong> ${editedClientInfo.phone1}</p>
        <p><strong>Phone 2:</strong> ${editedClientInfo.phone2}</p>
        <p><strong>E-mail:</strong> ${editedClientInfo.email}</p>
        <p><strong>Language:</strong> ${editedClientInfo.language}</p>
        <p><strong>Gender:</strong> ${editedClientInfo.gender}</p>
        <p><strong>Personal ID:</strong> ${editedClientInfo.personalID}</p>
        <p><strong>Status:</strong> ${editedClientInfo.status}</p>
        <p><strong>Gift Category:</strong> ${editedClientInfo.giftCategory}</p>
        <p><strong>Essential:</strong> ${editedClientInfo.essential}</p>
        <!-- Add more detailed client information here -->
        <div class="edit_delete">
            <button id="editButton">Edit</button>
            <button id="deleteButton">Delete</button>
        </div>
    `;

    // Add content to the modal content
    modalContent.innerHTML = content;

    // Add event listeners to the edit and delete buttons
    const editButton = document.getElementById('editButton');
    editButton.addEventListener('click', () => {
        editClientInfo(editedClientInfo, key);
    });

    const deleteButton = document.getElementById('deleteButton');
    deleteButton.addEventListener('click', () => {
        deleteClient(key);
        document.body.removeChild(modalContent);
        removeClientFromView(key); 
    });

    // Update the corresponding client div in the client list if it exists
    const clientDiv = document.getElementById(key);
    if (clientDiv) {
        const clientInfoContainer = clientDiv.querySelector('.inf');
        if (clientInfoContainer) {
            Object.keys(editedClientInfo).forEach(fieldName => {
                const fieldElement = clientInfoContainer.querySelector(`[data-field="${fieldName}"]`);
                if (fieldElement) {
                    fieldElement.textContent = editedClientInfo[fieldName];
                }
            });
        }
    }
    
    // Update the client div in the client list
    updateClientInView(key, editedClientInfo);

    renderClientList();
}

function updateClientInView(key, editedClientInfo) {
    const clientDiv = document.getElementById(key);
    if (clientDiv) {
        const clientInfoContainer = clientDiv.querySelector('.inf');
        if (clientInfoContainer) {
            Object.keys(editedClientInfo).forEach(fieldName => {
                const fieldElement = clientInfoContainer.querySelector(`[data-field="${fieldName}"]`);
                if (fieldElement) {
                    fieldElement.textContent = editedClientInfo[fieldName];
                }
            });
        }
    }
}

function deleteClient(key) {
    localStorage.removeItem(key);
    
    // Remove the corresponding client div from the client list
    const clientDiv = document.getElementById(key);
    if (clientDiv) {
        clientList.removeChild(clientDiv);
    }
}

    renderClientList();

function removeClientFromView(key) {
    const clientDiv = document.getElementById(key);
    if (clientDiv) {
        clientList.removeChild(clientDiv);
    }
}

// Add event listener to the file input element
document.getElementById('fileInput').addEventListener('change', handleFileUpload);

// Function to handle file upload
function handleFileUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0]; // Assuming the data is in the first sheet

        // Convert Excel data to JSON
        const excelData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // Process each row of Excel data and create clients
        excelData.forEach(column => { // Changed 'row' to 'column' here
            const clientInfo = {
                clientKey: column['Client Key'],
                codeInn: column['Code inn'],
                clientShort: column['Client Short'],
                corpUser: column['Corp User'],
                corpSHGS: column['CorpSHGC'], // Corrected key name
                cluster: column['Cluster'],
                corpGroup: column['Corp Group'],
                team: column['Team'],
                representative: column['Representative'],
                position: column['Position'],
                birthday: column['Birthday'],
                city: column['City'],
                address: column['Address'],
                phone1: column['Phone 1'],
                phone2: column['Phone 2'],
                email: column['E-mail'], // Corrected key name
                language: column['Language'],
                gender: column['Gender'],
                personalID: column['Personal ID'],
                status: column['Status'],
                giftCategory: column['Gift Category'],
                essential: column['Gift is Essential'],
                // Map other fields from Excel columns to clientInfo properties
            };

            saveClientInfo(clientInfo); // Save client information
        });

        renderClientList(); // Render the updated client list
    };

    reader.readAsArrayBuffer(file);
}

// Get references to elements
const fileInput = document.getElementById('fileInput');
const uploadLabel = document.getElementById('uploadLabel');

// Add click event listener to the label
uploadLabel.addEventListener('click', function() {
    // Trigger click event on the file input
    fileInput.click();
});

// Add change event listener to the file input
fileInput.addEventListener('change', handleFileUpload);



// Call renderClientList when the page loads to display the client list
renderClientList();

// Function to handle the download button click event
document.getElementById('downloadButton').addEventListener('click', function() {
    // Get all clients from localStorage
    const clients = Object.keys(localStorage).map(key => {
        return JSON.parse(localStorage.getItem(key));
    });

    // Check if there are any clients to export
    if (clients.length === 0) {
        alert('No clients to export!');
        return;
    }

    // Create a new workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(clients);

    // Add filters to every field
    ws['!autofilter'] = { ref: XLSX.utils.encode_range(XLSX.utils.decode_range(ws['!ref'])) };

    // Customize the styling for field names
    const headerCellStyle = {
        fill: { bgColor: { indexed: 64 }, fgColor: { rgb: 'FF661B' } }, // RGB(255,103,27) fill color
        font: { color: { rgb: 'FFFFFF' } } // white text color
    };

    // Apply the style to the first row (field names) for fields with text
    Object.keys(clients[0]).forEach((fieldName, index) => {
        if (fieldName.trim() !== '') {
            const cellRef = XLSX.utils.encode_cell({ r: 0, c: index });
            ws[cellRef].s = headerCellStyle;
        }
    });

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Clients');

    // Generate a download link for the workbook
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    function s2ab(s) {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }
    const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);

    // Create a download link and click it
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clients.xlsx';
    document.body.appendChild(a);
    a.click();

    // Cleanup
    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
});
