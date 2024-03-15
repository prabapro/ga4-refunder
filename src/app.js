// G-9QWBNVSMPX
// HtYuSNHJRFGFDIF9VMyvkQ

console.log("app.js loaded...");

const button = document.getElementById("submit");
const debugCheckbox = document.getElementById("debug");
const validationBox = document.querySelector("#validation-message");
const urlBlock = document.getElementById("url-block");
const payloadBlock = document.getElementById("payload-block");

document.addEventListener("DOMContentLoaded", () => {
	const clientIdInput = document.querySelector("#clientId");
	const currencyInput = document.querySelector("#currency");
	const transactionAmountInput = document.querySelector("#transactionAmount");
	const transactionIdInput = document.querySelector("#transactionId");

	// Retrieve form values from local storage
	const getFormValues = () => ({
		measurementId: localStorage.getItem("measurementId") || "",
		apiSecret: localStorage.getItem("apiSecret") || "",
	});

	let { measurementId, apiSecret } = getFormValues();

	console.log(getFormValues());

	const updateInputFields = () => {
		document.querySelector("#measurementId").value = measurementId;
		document.querySelector("#apiKey").value = apiSecret;
	};

	const addFieldGroup = () => {
		const container = document.getElementById("field-container");
		const fieldGroup = document.createElement("div");
		fieldGroup.classList.add("field-group"); // Add class for styling purposes
		fieldGroup.innerHTML = `
            <label>Item ID:</label>
            <input type="text" name="itemId[]" required>
            <label>Quantity:</label>
            <input type="number" name="quantity[]">
            <label>Price:</label>
            <input type="text" name="price[]">
            <button type="button" class="remove-field-group">Remove</button>
        `;
		container.appendChild(fieldGroup);

		fieldGroup
			.querySelector(".remove-field-group")
			.addEventListener("click", function () {
				this.parentNode.remove();
				displayCodeBlock(); // Update code blocks when a field group is removed
			});

		displayCodeBlock(); // Update code blocks when a new field group is added
	};

	// Display validation server related info
	const displayValidationBox = () => {
		validationBox.style.display = debugCheckbox.checked ? "block" : "none";
	};

	// Update submit button label when the validation server debugCheckbox is checked
	const updateButtonText = () => {
		button.textContent = debugCheckbox.checked
			? "Validate the request"
			: "Send Refund";
	};

	// Update the MP URL when the validation server debugCheckbox is checked
	const updateUrl = () => {
		const endPoint = debugCheckbox.checked ? "debug/mp/collect" : "mp/collect";
		const url = `https://www.google-analytics.com/${endPoint}?measurement_id=${measurementId}&api_secret=${apiSecret}`;

		if (debugCheckbox.checked) {
			console.info(`Debug url enabled: ${url}`);
		}
		return url;
	};

	// Function to display URL and payload in code blocks
	const displayCodeBlock = () => {
		const url = updateUrl();
		urlBlock.textContent = `URL: ${url}`;

		const items = getItemsData();
		const payload = {
			client_id: clientIdInput.value,
			events: [
				{
					name: "refund",
					params: {
						currency: currencyInput.value,
						transaction_id: transactionIdInput.value,
						value: transactionAmountInput.value,
						items,
					},
				},
			],
		};
		payloadBlock.textContent = `Payload: \n${JSON.stringify(payload, null, 2)}`;
	};

	// Construct items array
	const getItemsData = () => {
		const itemIds = [...document.querySelectorAll('input[name="itemId[]"]')];
		const quantities = [
			...document.querySelectorAll('input[name="quantity[]"]'),
		];
		const prices = [...document.querySelectorAll('input[name="price[]"]')];

		return itemIds.map((itemIdElement, index) => {
			const itemId = itemIdElement.value;
			const quantity = parseInt(quantities[index].value, 10) || 1;
			const price = prices[index].value
				? parseFloat(prices[index].value).toFixed(2)
				: undefined;

			return {
				item_id: itemId,
				quantity,
				price,
			};
		});
	};

	const sendRefund = async (event) => {
		event.preventDefault();
		const items = getItemsData();

		// Log the request payload before sending it
		const payload = {
			client_id: clientIdInput.value,
			events: [
				{
					name: "refund",
					params: {
						currency: currencyInput.value,
						transaction_id: transactionIdInput.value,
						value: transactionAmountInput.value,
						items,
					},
				},
			],
		};
		const payloadString = JSON.stringify(payload, null, 2);
		console.log("%cPayload:", "font-weight: bold; color: blue;");
		console.log(payloadString);

		try {
			const url = updateUrl(); // Update URL when input values change
			const response = await fetch(url, {
				method: "POST",
				body: JSON.stringify(payload),
			});

			const data = await response.json();
			const serverResponse = data.validationMessages[0]?.description || "";
			const messageToLog = serverResponse
				? `😭 ${serverResponse}`
				: "✅ No errors found in payload";
			console.log("Server response:", messageToLog);
		} catch (error) {
			// Handle errors
			console.error("Error:", error);
		}
	};

	// Event listener to the debugCheckbox to update the button text dynamically
	debugCheckbox.addEventListener("change", () => {
		updateButtonText();
		displayValidationBox();
		displayCodeBlock(); // Update code blocks when debug checkbox is interacted with
	});

	// Event listener to update local storage when input values change
	document.querySelectorAll("#measurementId, #apiKey").forEach((input) => {
		input.addEventListener("input", () => {
			measurementId = document.querySelector("#measurementId").value;
			apiSecret = document.querySelector("#apiKey").value;

			localStorage.setItem("measurementId", measurementId);
			localStorage.setItem("apiSecret", apiSecret);

			displayCodeBlock(); // Update code blocks when input values change
		});
	});

	// Event listener to add item field groups
	document.getElementById("add-field-group").addEventListener("click", () => {
		addFieldGroup(); // Update code blocks when a new field group is added
	});

	// Event listener to send refund payload on form submit
	document.querySelector("#refund-form").addEventListener("submit", sendRefund);

	// Event listener to update code block on form field change
	document
		.querySelectorAll(
			"#clientId, #currency, #transactionAmount, #transactionId, input[name^='itemId'], input[name^='quantity'], input[name^='price']"
		)
		.forEach((input) => {
			input.addEventListener("input", () => {
				displayCodeBlock(); // Update code blocks in real-time
			});
		});

	// Call functions
	updateInputFields();
	updateButtonText();
	displayValidationBox();
	displayCodeBlock(); // Initial display of code block

	// Update code blocks when debug checkbox is initially checked
	if (debugCheckbox.checked) {
		displayCodeBlock();
	}
});