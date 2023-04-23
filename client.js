const addAlbumForm = document.querySelector('#add-album-form');

const fetchStartPage = async () => {
  try {
    const response = await fetch('/', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    console.log(data);
  } catch (err) {
    console.log('frontend / route is kaputt')
    console.log(err);
  }
};

// get all albums - works
async function fetchAllAlbums() {
  try {
    const response = await fetch('http://localhost:3000/api/albums', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error('Could not fetch album data');
    }
  } catch (err) {
    console.log('frontend /albums GET route is kaputt')
    console.log(err);
  }
}

// get album by title - works
async function fetchAlbum(title) {
  try {
    const response = await fetch(`http://localhost:3000/api/albums/${title}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error('Could not fetch album data');
    }
  } catch (err) {
    console.log(`Could not fetch album with title ${title}`);
    console.log(err);
  }
}

// add new album - works
async function addAlbum(album) {
  try {
    const response = await fetch('http://localhost:3000/api/albums', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(album)
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error('Could not add album');
    }
  } catch (err) {
    console.log('frontend /albums POST route is kaputt')
    console.log(err);
  }
}

// edit an album - works
async function updateAlbum(id, updatedAlbum) {
  try {
    const response = await fetch(`http://localhost:3000/api/albums/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedAlbum)
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error('Could not update album');
    }
  } catch (err) {
    console.log('frontend /albums PUT route is kaputt')
    console.log(err);
  }
}

// delete an album - works
async function deleteAlbum(id) {
  const confirmDelete = window.confirm('Are you sure you want to delete this album?');
  if (!confirmDelete) return;
  try {
    const response = await fetch(`http://localhost:3000/api/albums/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error('Could not delete album');
    }
  } catch (err) {
    console.log('frontend /albums DELETE route is kaputt')
    console.log(err);
  }
}

// on page load, render all albums from the database to index.html where container is the div with id="album-list"
const renderAlbums = async () => {
  const albums = await fetchAllAlbums();
  const container = document.querySelector('#album-list');
  container.innerHTML = '';
  albums.forEach((album) => {
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="card" style="width: 18rem;">
        <div class="card-body">
          <h3 class="card-title">${album.title}</h3>
          <p class="card-text">${album.artist}</p>
          <p class="card-text">${album.year}</p>
          <button type="button" class="details-btn" data-id="${album._id}">Details</button>
          <button type="button" class="delete-btn" data-id="${album._id}">Delete</button>
        </div>
        <div id="edit-modal" class="modal">
          <div class="modal-content">
            <h2>Edit Album</h2>
            <form id="edit-form">
              <label for="title">Title:</label>
              <input type="text" id="title" name="title" required><br><br>
              <label for="artist">Artist:</label>
              <input type="text" id="artist" name="artist" required><br><br>
              <label for="year">Year:</label>
              <input type="number" id="year" name="year" required><br><br>
              <button type="submit" class="edit-btn" data-id="${album._id}">Edit</button>
              </form>
          </div>
        </div>
      </div>
    `;
    container.appendChild(div);
  });

  // add event listeners to buttons - unsure what the purpose of this is, but it's there
  const detailsBtns = document.querySelectorAll('.details-btn');
  detailsBtns.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const album = await fetchAlbum(e.target.dataset.id);
    });
  });

  const editForm = document.querySelectorAll('#edit-form');
  editForm.forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = form.title.value;
      const artist = form.artist.value;
      const year = form.year.value;
      const albumId = form.querySelector('.edit-btn').dataset.id;
      const updatedAlbum = {
        _id: albumId,
        title: title,
        artist: artist,
        year: year
      };
      const album = await updateAlbum(albumId, updatedAlbum);
      console.log(album);
      location.reload();
    });
  });

  const deleteBtns = document.querySelectorAll('.delete-btn');
  deleteBtns.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const album = await deleteAlbum(e.target.dataset.id);
      console.log(album);
      location.reload();
    });
  });
};

// when the page loads, render all albums
window.addEventListener('load', renderAlbums);

// event listener for finding an album by title, I wrapped it in a DOMContentLoaded event listener to avoid issues
document.addEventListener('DOMContentLoaded', () => { 
  const searchResultContainer = document.querySelector('#search-result-container');
  const searchForm = document.querySelector('#search-form');
  // add an event listener to the form for when it is submitted
  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
  
    // get the value of the input field
    const title = searchForm.name.value;
  
    // call the fetchAlbum function to fetch the album data
    const album = await fetchAlbum(title);
  
    // clear any previous results from the container
    searchResultContainer.innerHTML = '';
  
    // check if an album was found
    if (album === null) {
      searchResultContainer.innerHTML = '<p>No matching album found.</p>';
    } else {
      // display the album data
      const div = document.createElement('div');
      div.classList.add('card');
      div.innerHTML = `
        <div class="card-body">
          <h3 class="card-title">${album.title}</h3>
          <p class="card-text">${album.artist}</p>
          <p class="card-text">${album.year}</p>
        </div>
      `;
      searchResultContainer.appendChild(div);
    }
  });
});

// submit to add new album
addAlbumForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = addAlbumForm.title.value;
  const artist = addAlbumForm.artist.value;
  const year = addAlbumForm.year.value;

  const album = { title, artist, year };
  try {
    const addedAlbum = await addAlbum(album);
    console.log(addedAlbum);
  } catch (err) {
    console.log(err);
  }
  location.reload();
});