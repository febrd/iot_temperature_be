export async function fetchDataFromFirebase() {
    const url = 'https://firebasestorage.googleapis.com/v0/b/java-7dcd9.appspot.com/o/sensor_data.json?alt=media&token=1f713d81-49e9-4c14-bd8b-afadb312ed80';
    const response = await fetch(url);
    const data = await response.json();
    return data;
  }
  

  