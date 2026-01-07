document.addEventListener('DOMContentLoaded', async () => {
    // 1. Sprawdzenie sesji i pobranie ID
    const user = getUser(); 
    console.log(JSON.stringify(user));
    if (!user) {
        alert("Sesja wygasła. Zaloguj się ponownie.");
        window.location.href = '../login.html';
        return;
    }

    // Obsługa różnych nazw ID (zależnie od tego co zwraca baza)
    const userId = user.KlientID || user.id; 

    // Kontener na bilety
    const container = document.getElementById('tickets-container');
    container.innerHTML = '<div style="text-align:center; padding:20px;">Pobieranie biletów...</div>';

    try {
        // 2. Pobranie danych z API
        const bilety = await apiFetch(`/moje-bilety/${userId}`);

        container.innerHTML = ''; // Czyścimy loader

        if (!bilety || !bilety.length) {
            container.innerHTML = '<div style="text-align:center; padding:30px; font-size:18px;">Nie masz jeszcze żadnych biletów.</div>';
            return;
        }

        // 3. Generowanie kafelków
        bilety.forEach(b => {
            // Wyciąganie danych
            const lot = b.rezerwacja?.lot || {};
            const trasa = lot.trasa || {};
            
            const wylot = trasa.lotnisko_wylotu?.miasto || 'Nieznane';
            const przylot = trasa.lotnisko_przylotu?.miasto || 'Nieznane';
            const dataLotu = lot.data || '-';   // Oczekujemy formatu YYYY-MM-DD
            const godzina = lot.godzina || '-'; // Oczekujemy formatu HH:MM
            
            // Konwersja czasu lotu na liczbę (zabezpieczenie)
            // Upewnij się, że w bazie pole nazywa się 'czas_lotu' lub 'czas_przelotu'
            const czasLotu = Number(trasa.czas_lotu) || Number(trasa.czas_przelotu) || 0;
            
            // Domyślne wartości
            let godzinaPrzylotu = "??:??";
            let dataPrzylotu = ""; // Pusty string na start

            // --- DIAGNOSTYKA (Podgląd w konsoli F12) ---
            console.log(`Bilet ${b.numer_biletu}: Data=${dataLotu}, Godz=${godzina}, Czas=${czasLotu}`);

            // Logika obliczania
            if (dataLotu && godzina && czasLotu > 0) {
                try {
                    // Tworzymy datę startową
                    // dataLotu musi być: "2025-12-21", godzina: "12:30"
                    const start = new Date(`${dataLotu}T${godzina}`);
                    
                    // Dodajemy minuty (czasLotu * 60000 ms)
                    const koniec = new Date(start.getTime() + czasLotu * 60000);

                    if (!isNaN(koniec.getTime())) {
                        // Formatowanie godziny (HH:MM)
                        const g = String(koniec.getHours()).padStart(2, '0');
                        const m = String(koniec.getMinutes()).padStart(2, '0');
                        godzinaPrzylotu = `${g}:${m}`;

                        // Formatowanie daty przylotu (DD.MM.YYYY)
                        const dzien = String(koniec.getDate()).padStart(2, '0');
                        const miesiac = String(koniec.getMonth() + 1).padStart(2, '0');
                        const rok = koniec.getFullYear();
                        
                        // Zapisujemy datę do zmiennej używanej w HTML
                        dataPrzylotu = `${rok}-${miesiac}-${dzien}`;

                        // Opcjonalnie: dodaj info jeśli to kolejny dzień
                        if (koniec.getDate() !== start.getDate()) {
                            dataPrzylotu += ' <span style="font-size:0.8em; color:#666">(+1 dzień)</span>';
                        }
                    }
                } catch (err) {
                    console.error("Błąd obliczania daty:", err);
                }
            }

            const numerBiletu = b.numer_biletu || 'REF-???';
            const status = b.status || '???';
            const miejsce = b.miejsce?.numer || '???';
            const klasa = b.miejsce?.klasa || '???';
            const pasazerImie = user.imie || '???'; // Upewnij się czy user.Imie czy user.imie (wielkość liter!)
            const pasazerNazwisko = user.nazwisko || '???';

            // --- TWORZENIE ELEMENTÓW DOM ---
            const ticketRow = document.createElement('div');
            ticketRow.className = 'ticket-row tickets-grid-layout';
            
            ticketRow.innerHTML = `
                <div>${numerBiletu}</div>
                <div>${wylot} - ${przylot}</div>
                <div>${godzina} &nbsp; ${dataLotu}</div>
                <div>${status}</div>
                <button class="btn-details">Szczegóły</button>
            `;

            const detailsPanel = document.createElement('div');
            detailsPanel.className = 'ticket-details-panel';
            detailsPanel.style.display = 'none';

            // UWAGA: Poprawiłem zmienną user.imie na pasazerImie w HTML poniżej
            detailsPanel.innerHTML = `
                <div class="details-column">
                    <div><strong>Imię pasażera:</strong> ${pasazerImie}</div>
                    <div><strong>Nazwisko pasażera:</strong> ${pasazerNazwisko}</div>
                </div>
                
                <div class="details-column">
                    <div><strong>ID biletu:</strong> ${numerBiletu}</div>
                    <div><strong>Status:</strong> ${status}</div>
                </div>

                <div class="details-column">
                    <div><strong>Godzina wylotu:</strong> ${godzina} ${dataLotu}</div>
                    <div><strong>Godzina przylotu:</strong> ${godzinaPrzylotu} ${dataPrzylotu}</div>
                </div>

                <div class="details-column">
                    <div><strong>Klasa:</strong> ${klasa}</div>
                    <div><strong>Miejsce:</strong> ${miejsce}</div>
                </div>

                <div class="actions-column">
                    <button class="btn-action-white" onclick="alert('Zmiana miejsca')">Zmień miejsce</button>
                    <button class="btn-action-white" onclick="alert('Rezygnacja')">Zrezygnuj</button>
                    <button class="btn-action-white" onclick="alert('Faktura')">Drukuj fakturę</button>
                </div>
            `;
            
            // ... reszta kodu obsługi przycisku (bez zmian) ...
            const btnDetails = ticketRow.querySelector('.btn-details');
            btnDetails.addEventListener('click', () => {
                const isHidden = detailsPanel.style.display === 'none';
                if (isHidden) {
                    detailsPanel.style.display = 'flex';
                    ticketRow.classList.add('expanded');
                    btnDetails.textContent = 'Zwiń';
                } else {
                    detailsPanel.style.display = 'none';
                    ticketRow.classList.remove('expanded');
                    btnDetails.textContent = 'Szczegóły';
                }
            });

            container.appendChild(ticketRow);
            container.appendChild(detailsPanel);
        });

    } catch (e) {
        console.error(e);
        container.innerHTML = '<div style="text-align:center; color:red; padding:20px;">Błąd pobierania biletów z serwera.</div>';
    }
});

