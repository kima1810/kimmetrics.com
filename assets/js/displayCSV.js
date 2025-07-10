window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('table-container');
  const csvPath = container.getAttribute('data-csv');

  let currentSortedCol = null;
  let sortAsc = true;

  if (!csvPath) {
    container.innerHTML = '<p>No CSV file specified.</p>';
    return;
  }

  fetch(csvPath)
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.text();
    })
    .then(csvText => {
      const result = Papa.parse(csvText.trim(), {
        header: false,
        skipEmptyLines: true,
      });

      const rows = result.data;
      renderTable(rows);
    })
    .catch(error => {
      container.innerHTML = `<p>Error loading CSV: ${error.message}</p>`;
    });

  function renderTable(data) {
    const table = document.createElement('table');
    const headerRow = data[0];
    const tbodyData = data.slice(1);

    const thead = document.createElement('thead');
    const headTr = document.createElement('tr');

    headerRow.forEach((header, colIndex) => {
      const th = document.createElement('th');
      th.style.cursor = 'pointer';

      let headerText = header.trim();
      if (colIndex === currentSortedCol) {
        headerText += sortAsc ? ' ↑' : ' ↓';
      }
      th.textContent = headerText;

      th.addEventListener('click', () => {
        if (currentSortedCol === colIndex) {
          sortAsc = !sortAsc; // Toggle direction
        } else {
          currentSortedCol = colIndex;
          sortAsc = true;
        }

        sortTableByColumn(tbodyData, colIndex);
        renderTable([headerRow, ...tbodyData]);
      });

      headTr.appendChild(th);
    });

    thead.appendChild(headTr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    tbodyData.forEach(row => {
      const tr = document.createElement('tr');
      row.forEach(cell => {
        const td = document.createElement('td');
        td.textContent = cell.trim();
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);

    container.innerHTML = '';
    container.appendChild(table);
  }

  function sortTableByColumn(data, colIndex) {
    data.sort((a, b) => {
      const valA = a[colIndex] || '';
      const valB = b[colIndex] || '';

      const numA = parseFloat(valA.replace(/[^0-9.\-:]/g, ''));
      const numB = parseFloat(valB.replace(/[^0-9.\-:]/g, ''));

      if (!isNaN(numA) && !isNaN(numB)) {
        return sortAsc ? numA - numB : numB - numA;
      }

      return sortAsc
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });
  }
});
