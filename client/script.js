import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

// AI thinking about a statement
function loader(item) {
	item.textContent = "";

	loadInterval = setInterval(() => {
		item.textContent += ".";

		if (item.textContent === "....") {
			item.textContent = "";
		}
	}, 300);
}

function typeText(item, text) {
	let index = 0;
	let interval = setInterval(() => {
		if (index < text.length) {
			item.innerHTML += text.charAt(index);
			index++;
		} else {
			clearInterval(interval);
		}
	}, 20);
}

function generateUniqueID() {
	const timestamp = Date.now();
	const randomNumber = Math.random();
	const hexdexString = randomNumber.toString(16);

	return `id-${timestamp}-${hexdexString}`;
}

function chatStripe(isAi, value, uniqueID) {
	return `
    <div class="wrapper ${isAi && "ai"}">
      <div class="chat">
        <div class="profile">
          <img
            src="${isAi ? bot : user}"
            alt="${isAi ? "bot" : "user"}"
          />
        </div>
        <div class="message" id=${uniqueID}>${value}</div>
      </div>
    </div>
    `;
}

const handleSubmit = async (e) => {
	e.preventDefault();

	const data = new FormData(form);

	// User chat stripe
	chatContainer.innerHTML += chatStripe(false, data.get("prompt"));
	form.reset();

	// Bot chat stripe
	const uniqueID = generateUniqueID();
	chatContainer.innerHTML += chatStripe(true, " ", uniqueID);

	chatContainer.scrollTop = chatContainer.scrollHeight;

	const messageDiv = document.getElementById(uniqueID);
	loader(messageDiv);

	// data from server
	const response = await fetch("https://gpt-clone.onrender.com", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			prompt: data.get("prompt"),
		}),
	});
	clearInterval(loadInterval);
	messageDiv.innerHTML = "";

	if (response.ok) {
		const data = await response.json();
		const parsedData = data.bot.trim();

		console.log(parsedData);

		typeText(messageDiv, parsedData);
	} else {
		const err = await response.text();
		messageDiv.innerHTML = "An error occured";
		alert(err);
	}
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (event) => {
	if (event.keyCode === 13) {
		handleSubmit(event);
	}
});
