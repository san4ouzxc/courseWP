const cities = ["Київ", "Львів", "Одеса", "Харків", "Дніпро"];

function setupAutocomplete(inputId, suggestionBoxId) {
  const input = document.getElementById(inputId);
  const suggestions = document.getElementById(suggestionBoxId);

  input.addEventListener("focus", () => {
    showSuggestions("");
  });

  input.addEventListener("input", () => {
    showSuggestions(input.value);
  });

  function showSuggestions(query) {
    const lowerQuery = query.toLowerCase();
    suggestions.innerHTML = "";

    const matches = cities.filter(city =>
      city.toLowerCase().includes(lowerQuery)
    );

    if (matches.length > 0) {
      matches.forEach(city => {
        const div = document.createElement("div");
        div.textContent = city;
        div.onclick = () => {
          input.value = city;
          suggestions.innerHTML = "";
          suggestions.style.display = "none";
        };
        suggestions.appendChild(div);
      });
      suggestions.style.display = "block";
    } else {
      suggestions.style.display = "none";
    }
  }

  document.addEventListener("click", (e) => {
    if (!suggestions.contains(e.target) && e.target !== input) {
      suggestions.style.display = "none";
    }
  });
}

setupAutocomplete("from", "from-suggestions");
setupAutocomplete("to", "to-suggestions");
