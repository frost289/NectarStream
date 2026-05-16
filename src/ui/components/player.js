export function renderPlayer() {
  const container = document.getElementById('player-container')
  if (!container || container.innerHTML !== "") return
  container.innerHTML = `
    <div style="position: fixed; bottom: 0; left: 0; width: 100%; background: #222; color: white; padding: 15px; text-align: center;">
      Media Player Active
    </div>
  `
}