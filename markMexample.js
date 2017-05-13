// TODO: Escape all input and un-escape it at the server-side.

const WEBAPP_URL=""

const createTeamSection = document.getElementById('CreateTeamDiv');
const createProjectSection = document.getElementById('CreateProjectDiv');
const searchProjectSection = document.getElementById('SearchProjectDiv');
const getProjectInventorySection = document.getElementById('GetProjectInventoryDiv');
const scanProjectSection = document.getElementById('ScanProjectDiv');
const configureProjectSection = document.getElementById('ConfigureProjectDiv');
const uploadFileSection = document.getElementById('UploadFileDiv');
const searchUserSection = document.getElementById('SearchUserDiv');
const isProjectScanningSection = document.getElementById('IsProjectScanningDiv');

const resultsTextArea = document.getElementById('RestAPIResultsText');

function checkRequiredField(fieldName, htmlFieldName) {
	if (document.getElementById(htmlFieldName).value === "") {
		document.getElementById(htmlFieldName + "Error").innerHTML = "*Required Field*";
		return false;
	}
	return true;
}

function jwtTokenExists() {
	var jwtTokenValue = document.getElementById("JWTToken").value;
	if (jwtTokenValue === "") {
		document.getElementById("JWTTokenError").innerHTML = "JWT Token is required for calling REST API methods!";
		return false;
	}
	return true;
}

function clearFieldWarnings() {
	document.getElementById("JWTTokenError").innerHTML = "";
	document.getElementById("SearchProjectTeamNameFieldError").innerHTML = "";
	document.getElementById("SearchProjectProjectNameFieldError").innerHTML = "";
}

function hideCallApiDivs() {
	createTeamSection.style.display = 'none';
	createProjectSection.style.display = 'none';
	searchProjectSection.style.display = 'none';
	getProjectInventorySection.style.display = 'none';
	scanProjectSection.style.display = 'none';
	configureProjectSection.style.display = 'none';
	uploadFileSection.style.display = 'none';
	searchUserSection.style.display = 'none';
	isProjectScanningSection.style.display = 'none';
}

function clearResults() {
	resultsTextArea.value = "";
}

function initializePage() {

	hideCallApiDivs();
	createTeamSection.style.display = 'block';


	// Code to handle changes in the selected API
	var apiSelection = document.getElementById('RestAPISelection')
	apiSelection.addEventListener('change', function(evt) {

		const selectedApi = evt.target.value;
		console.log("Event value: " + selectedApi);

		// Clear results textarea
		resultsTextArea.value = "";
		// Reset border color of results text area
		resultsTextArea.className = "RestAPIResults_Default";

		// Hide the API divs (if visible)
		clearFieldWarnings()
		hideCallApiDivs();

		// Show API div for selected API
		if (selectedApi === "CreateTeamApi") {
			createTeamSection.style.display = 'block';
		} else if (selectedApi === "CreateProjectApi") {
			createProjectSection.style.display = 'block';
		} else if (selectedApi === "SearchProjectApi") {
			searchProjectSection.style.display = 'block';
		} else if (selectedApi === "GetProjectInventoryApi") {
			getProjectInventorySection.style.display = 'block';
		} else if (selectedApi === "ScanProjectApi") {
			scanProjectSection.style.display = 'block';			
		} else if (selectedApi === "ConfigureProjectApi") {
			configureProjectSection.style.display = 'block';			
		} else if (selectedApi == 'UploadFileApi') {
			uploadFileSection.style.display = 'block';
		} else if (selectedApi == 'SearchUserApi') {
			searchUserSection.style.display = 'block';
		} else if (selectedApi == 'IsProjectScanningApi') {
			isProjectScanningSection.style.display = 'block';
		} else {
			throw "Unsupported API method: " + selectedApi;
		}

	});

	// Code to handle calls to the RestAPI
	var callApiButton = document.getElementById('CallApiButton');
	callApiButton.addEventListener('click', function(evt) {
		const selectedApi = document.getElementById('RestAPISelection').value;


		if (selectedApi == "CreateTeamApi") {
			callCreateTeamApi();
		} else if (selectedApi == "CreateProjectApi") {
			callCreateProjectApi();
		} else if (selectedApi == "SearchProjectApi") {
			callSearchProjectApi()
		} else if (selectedApi == "GetProjectInventoryApi") {
			callGetInventoryApi();
		} else if (selectedApi == "ScanProjectApi") {
			callScanProjectApi();
		} else if (selectedApi == "ConfigureProjectApi") {
			callConfigureProjectApi();
		} else if (selectedApi == "UploadFileApi") {
			callUploadFileApi();
		} else if (selectedApi == "SearchUserApi") {
			callSearchUserApi();
		} else if (selectedApi == "IsProjectScanningApi") {
			callIsProjectScanningApi();
		} else {
			alert("Unsupported API method: " + selectedApi);
		}
	})

	// When user selects a file, store its contents in the page
	document.getElementById('UploadFileFileField').addEventListener('change', function(){
		console.log("Reading file contents...");
		if (this.files[0]) {
			document.getElementById('UploadFileStatus').innerHTML  = "Uploading..."
		    var reader = new FileReader();
			reader.addEventListener("load", function () {
				// remove some appended text from the header
		    	var base64String = reader.result.match(/,(.*)$/)[1];
		        document.getElementById('UploadFileFileContentsField').value = base64String;
				document.getElementById('UploadFileStatus').innerHTML  = "File ready for upload!"
				callApiButton.disabled = false;
		    })
			// Temporarily disable call API button
			callApiButton.disabled = true;
		    reader.readAsDataURL(this.files[0]);
		} else {
			document.getElementById('UploadFileStatus').innerHTML  = "";
		}
	}, false);
}

function callCreateTeamApi() {
	const teamName = document.getElementById('CreateTeamTeamNameField').value;
	const teamDescription = document.getElementById('CreateTeamDescriptionField').value;

	console.log("Team = " + teamName);

	let canCall = true;
	
	clearFieldWarnings()

	resultsTextArea.value = "";

	canCall = checkRequiredField("Team Name", "CreateTeamTeamNameField") && canCall;
	
	if (!jwtTokenExists()) {
		canCall = false;
	}

	if (canCall) {
		// Search here
		const teamNameEncoded = encodeURIComponent(teamName);
		resultsTextArea.value = "Calling REST API...";
		url = `createTeam?TeamName=${teamNameEncoded}`;

		callWebServiceApi("POST", url, teamDescription);
	}
}

function callCreateProjectApi() {
	const teamName = document.getElementById('CreateProjectTeamNameField').value;
	const projectName = document.getElementById('CreateProjectProjectNameField').value;
	const projectOwner = document.getElementById('CreateProjectProjectOwnerField').value;

	console.log("Team = " + teamName);
	console.log("Project Owner = " + projectOwner);
	console.log("Project Name = " + projectName);

	let canCall = true;
	
	clearFieldWarnings()

	resultsTextArea.value = "";

	canCall = checkRequiredField("Team Name", "CreateProjectTeamNameField") && canCall;
	canCall = checkRequiredField("Project Name", "CreateProjectProjectNameField") && canCall;
	canCall = checkRequiredField("Project Owner", "CreateProjectProjectOwnerField") && canCall;
	
	if (!jwtTokenExists()) {
		canCall = false;
	}

	if (canCall) {
		// Search here
		resultsTextArea.value = "Calling REST API...";
		const teamNameEncoded = encodeURIComponent(teamName);
		const projectNameEncoded = encodeURIComponent(projectName);
		const projectOwnerEncoded = encodeURIComponent(projectOwner);

		url = `createProject?TeamName=${teamNameEncoded}&ProjectOwner=${projectOwnerEncoded}&ProjectName=${projectNameEncoded}`;
		callWebServiceApi("GET", url);

	}
}

function callSearchProjectApi() {
	const teamName = document.getElementById('SearchProjectTeamNameField').value;
	const projectName = document.getElementById('SearchProjectProjectNameField').value;

	console.log("Team = " + teamName);
	console.log("Project = " + projectName);

	clearFieldWarnings()

	let canCall = true;
	
	resultsTextArea.value = "";

	canCall = checkRequiredField("Team Name", "SearchProjectTeamNameField") && canCall;
	canCall = checkRequiredField("Project Name", "SearchProjectProjectNameField") && canCall;

	if (!jwtTokenExists()) {
		canCall = false;
	}

	if (canCall) {
		// Search here
		resultsTextArea.value = "<h2>Calling RestAPI...</h2>"

		// Encode inputs
		const teamNameEncoded = encodeURIComponent(teamName);
		const projectNameEncoded = encodeURIComponent(projectName);

		url = `getProjectIdFromTeamProject?TeamName=${teamNameEncoded}&ProjectName=${projectNameEncoded}`;
		callWebServiceApi("GET", url);

	}
}

function callScanProjectApi() {

	const projectId = document.getElementById('ScanProjectProjectIdField').value;

	clearFieldWarnings()

	console.log("Project ID = " + projectId);

	let canCall = true;
	
	resultsTextArea.value = "";

	canCall = checkRequiredField("Project Id", "ScanProjectProjectIdField") && canCall;

	if (canCall) {
		// Search here
		resultsTextArea.value = "<h2>Calling API...</h2>"

		// Encode inputs
		const projectIdEncoded = encodeURIComponent(projectId);

		url = `scanProject?ProjectId=${projectIdEncoded}`;
		callWebServiceApi("GET", url);

	}
}

	function callGetInventoryApi() {
		const projectId = document.getElementById('GetInventoryProjectIdField').value;
	
		clearFieldWarnings()

		let canCall = true;

		canCall = checkRequiredField("Project Id", "GetInventoryProjectIdField") && canCall;

		if (canCall) {

			// Encode inputs
			const projectIdEncoded = encodeURIComponent(projectId);

			var urlPath = `getInventoryForProject?ProjectId=${projectIdEncoded}`;
			callWebServiceApi("GET", urlPath);
		}
	}

	function callConfigureProjectApi() {
		const projectId = document.getElementById('ConfigureProjectIdField').value;
	
		clearFieldWarnings()

		let canCall = true;
		const projectIdEncoded = encodeURIComponent(projectId);
		var urlPath = `configureProject?ProjectId=${projectIdEncoded}`;

		const scanServerAlias = document.getElementById("ConfigureProjectScanServerAliasField").value;
		if (scanServerAlias) {
			const scanServerAliasEncoded = encodeURIComponent(scanServerAlias);
			urlPath += `&ScanServerAlias=${scanServerAliasEncoded}`;
		}
		const scanProfileName = document.getElementById("ConfigureProjectScanProfileNameField").value;
		if (scanProfileName) {
			const scanProfileNameEncoded = encodeURIComponent(scanProfileName);
			urlPath += `&ScanProfileName=${scanProfileNameEncoded}`;
		}
		const autoPublishInventoryValue = document.getElementById("ConfigureProjectAutoPublishInventoryField").value;
		if (autoPublishInventoryValue) {
			urlPath += `&AutoPublishInventory=${autoPublishInventoryValue === "Yes" ? true : false}`;
		}
		const applyPoliciesToInventoryValue = document.getElementById("ConfigureProjectApplyPoliciesToInventoryField").value;
		if (applyPoliciesToInventoryValue) {
			urlPath += `&ApplyPoliciesToInventory=${applyPoliciesToInventoryValue === "Yes" ? true : false}`;
		}

		callWebServiceApi("GET", urlPath);
	}

	function callUploadFileApi() {
		const projectId = document.getElementById('UploadFileProjectIdField').value;
		const scannerAlias = document.getElementById('UploadFileScannerAliasField').value;
		const aFile = document.getElementById('UploadFileFileField');
		const fileContents = document.getElementById('UploadFileFileContentsField').value;
	
		// console.log("File name is: " + aFile.value);
		// console.log("File contents is: " + fileContents.value);

		clearFieldWarnings();

		let canCall = true;

		canCall = checkRequiredField("Project ID", "UploadFileProjectIdField") && canCall;
		canCall = checkRequiredField("File", "UploadFileFileField") && canCall;
		canCall = checkRequiredField("Scanner Alias", "UploadFileScannerAliasField") && canCall;

		if (canCall) {

			const projectIdEncoded = encodeURIComponent(projectId);
			const scannerAliasEncoded = encodeURIComponent(scannerAlias);

			const aFileName = encodeURIComponent(aFile.files[0].name);
			var urlPath = `uploadFile?ProjectId=${projectIdEncoded}&ScannerAlias=${scannerAliasEncoded}&FileName=${aFileName}`;

			callWebServiceApi("POST", urlPath, fileContents);
		}
	}

	function callSearchUserApi() {
		const emailAddress = document.getElementById('SearchUserEmailAddressField').value;

		console.log("Email Address = " + emailAddress);

		clearFieldWarnings()

		let canCall = true;
		
		resultsTextArea.value = "";

		canCall = checkRequiredField("Email Address", "SearchUserEmailAddressField") && canCall;

		if (!jwtTokenExists()) {
			canCall = false;
		}

		if (canCall) {
			// Search here
			resultsTextArea.value = "<h2>Calling RestAPI...</h2>"

			const emailAddressEncoded = encodeURIComponent(emailAddress);
			url = `searchUser?EmailAddress=${emailAddressEncoded}`;
			callWebServiceApi("GET", url);

		}
	}

	function callIsProjectScanningApi() {
		const projectId = document.getElementById('IsProjectScanningProjectIdField').value;
	
		clearFieldWarnings()

		let canCall = true;

		canCall = checkRequiredField("Project Id", "IsProjectScanningProjectIdField") && canCall;

		if (canCall) {
			const projectIdEncoded = encodeURIComponent(projectId);
			var urlPath = `isProjectScanning?ProjectId=${projectIdEncoded}`;
			callWebServiceApi("GET", urlPath);
		}
	}

	function callWebServiceApi(method, urlPath, body) {

	
		console.log("Inside callWebServiceApi...");
		console.log("URL Path = " + urlPath);
		url = `${WEBAPP_URL}/${urlPath}`;

		// Add the JWT token here
		const callToken = encodeURIComponent(document.getElementById('JWTToken').value);
		if (callToken === "") {
			resultsTextArea.value = "A JWT Token is required for calling Palamida Rest API services."
			console.error("No JWT Token specified!");
			return;
		} else {
			url += `&JwtToken=${callToken}`
		}


		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(e) {
		    console.log("Ready State = " + this.readyState);
		    if (this.readyState == 4) {
		    	console.log("Done: " + this.responseText)
		    	if (this.status != 200) {
		    		var errorMessage = this.responseText;
		    		if (errorMessage === "") {
						errorMessage = `Rest API Demo web server cannot be reached! Please check that the server is running.`;
		    		}

		    		resultsTextArea.value = errorMessage;
		    	} else {
			    	// Parse results
			    	var resultsObj = JSON.parse(this.responseText);
			    	console.log("Palamida response status: " + resultsObj.PalamidaStatusCode);
			    	const palamidaRestResponseObj = JSON.parse(resultsObj.PalamidaResponse)

			    	resultsTextArea.value = `Palamida Return Status: ${resultsObj.PalamidaStatusCode}\n`;
			    	resultsTextArea.value += "Palamida Returned Message:\n";
			    	resultsTextArea.value += JSON.stringify(palamidaRestResponseObj,null,4);

			    	// console.log(palamidaRestResponseObj)
			    	// Highlight border of results pane depending on success/failure
			    	// Success - Green
			    	// Failure - Red
			    	console.log("HTTP Status Code = " + palamidaRestResponseObj.HttpStatusCode);
			    	if (palamidaRestResponseObj.HttpStatusCode === 200) {
			    		// Draw a green border on the results to show success
			    		resultsTextArea.className = "RestAPIResults_Success";
			    	} else {
			    		// Draw a red border on the results to show there was an error
			    		resultsTextArea.className = "RestAPIResults_Error";			    		
			    	}
			    }
		    }
		}
		xhr.open(method, url);
		xhr.send(body);
	}

