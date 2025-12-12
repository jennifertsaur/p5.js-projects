/*
console.log('collector running');
const lon=120.312;
const lat=22.6203;


async function fetchHistoricalData() {
  const apiKey = 'bdf6eeb6e3abbd8875c6da58784debfa';
  const start=1762732800;
  const end=1763164800;
  const url = `https://api.openweathermap.org/data/2.5/air_pollution/history?lat=${lat}&lon=${lon}&start=${start}&end=${end}&appid=${apiKey}`;

  console.log('Fetching:', url);
  
  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error('HTTP ${res.status}');
      return res.json();
  })
    .then(data => {
      console.log('Data fetched:', data);
      saveJSON(data, 'kaohsiung_air_last5d.json');
      console.log('Saved: "kaohsiung_air_last5d.json"');
    })
    .catch(err => {
      console.error('Fetch failed:', err);
      
  });
}*/