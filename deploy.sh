#!/bin/bash

# Skrypt do wdrażania aplikacji DrawDB w kontenerze produkcyjnym

echo "🚀 Rozpoczynam wdrażanie produkcyjne DrawDB (z repo: https://github.com/daro/drawDB.git)..."

# Aktualizacja kodu z repozytorium
echo "📡 Sprawdzanie aktualizacji w repozytorium..."
git fetch origin
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ "$(git rev-parse HEAD)" != "$(git rev-parse origin/$CURRENT_BRANCH)" ]; then
  echo "⚠️  Wykryto niezgodność wersji z repozytorium zdalnym."
  echo "📥 Wymuszam pobieranie zmian (git pull --force)..."
  
  # Próba pull z force
  if ! git pull --force origin "$CURRENT_BRANCH"; then
    echo "🔥 Pull nie powiódł się z powodu konfliktów. Wykonuję twardy reset do origin/$CURRENT_BRANCH..."
    git reset --hard origin/"$CURRENT_BRANCH"
  fi
else
  echo "✅ Kod jest aktualny."
fi

# Sprawdzenie czy Docker jest uruchomiony
if ! docker info > /dev/null 2>&1; then
  echo "❌ Błąd: Docker nie jest uruchomiony. Uruchom Dockera i spróbuj ponownie."
  exit 1
fi

# Zatrzymanie i usunięcie starych kontenerów (jeśli istnieją)
echo "🛑 Zatrzymywanie starych kontenerów..."
docker compose -f docker-compose.prod.yml down

# Budowanie i uruchamianie nowej wersji
echo "🏗️  Budowanie i uruchamianie obrazu produkcyjnego..."
docker compose -f docker-compose.prod.yml up -d --build

# Sprawdzenie statusu
if [ $? -eq 0 ]; then
  echo "✅ Wdrożenie zakończone sukcesem!"
  echo "🌐 Aplikacja jest dostępna pod adresem: http://localhost:8081"
else
  echo "❌ Coś poszło nie tak podczas wdrażania."
  exit 1
fi
