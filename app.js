class App {
    constructor() {
        console.log("App works!");
        // array to store notes, represented by objects (before localStorage)
        // this.notes = [];
        // get notes from the browser (localstorage) and initialize our array,
        // otherwise initialize with empty array
        this.notes = JSON.parse(localStorage.getItem('notes')) || [];
        this.title = '';
        this.text = '';
        this.id = '';

        // DOM elements needed in the app
        this.$placeholder = document.querySelector('#placeholder');
        this.$form = document.querySelector('#form');
        this.$noteTitle = document.querySelector('#note-title');
        this.$noteText = document.querySelector('#note-text');
        this.$formButtons = document.querySelector('#form-buttons');
        this.$formCloseButton = document.querySelector('#form-close-button');
        this.$notes = document.querySelector('#notes');
        this.$modal = document.querySelector('.modal');
        this.$modalTitle = document.querySelector('.modal-title');
        this.$modalText = document.querySelector('.modal-text');
        this.$modalCloseButton = document.querySelector('.modal-close-button');
        this.$colorTooltip = document.querySelector('#color-tooltip');

        // display our initial notes
        this.render();
        this.addEventListeners();
    }
    addEventListeners() {
        document.body.addEventListener('click', event => {
            this.handleFormClick(event);
            this.selectNote(event);
            this.openModal(event);
            this.deleteNote(event);
        });

        document.body.addEventListener('mouseover', event => {
            this.openTooltip(event);
        });

        document.body.addEventListener('mouseout', event => {
            this.closeTooltip(event);
        });

        this.$colorTooltip.addEventListener('mouseover', function () {
            this.style.display = 'flex';
        });

        this.$colorTooltip.addEventListener('mouseout', function () {
            this.style.display = 'none';
        });

        this.$colorTooltip.addEventListener('click', event => {
            const color = event.target.dataset.color;
            if (color) {
                this.editNoteColor(color);
            }
        });

        this.$form.addEventListener('submit', event => {
            event.preventDefault();
            const title = this.$noteTitle.value;
            const text = this.$noteText.value;
            const hasNote = title || text;
            if (hasNote) {
                this.addNote({ title, text })

            } else {
                alert("enter data")
            }
        });
        this.$formCloseButton.addEventListener('click', event => {
            event.stopPropagation();
            this.closeForm();
        });
        this.$modalCloseButton.addEventListener('click', event => {
            this.closeModal(event);
        });
    }

    handleFormClick(event) {
        const isFormClicked = this.$form.contains(event.target);

        const title = this.$noteTitle.value;
        const text = this.$noteText.value;
        const hasNote = title || text;

        if (isFormClicked) {
            // open form
            this.openForm();
        } else if (hasNote) {
            this.addNote({ title, text })
        } else {
            // close form
            this.closeForm();
        }
    }
    openForm() {
        this.$form.classList.add('form-open');
        this.$noteTitle.style.display = 'block';
        this.$formButtons.style.display = 'block';
    }
    closeForm() {
        this.$form.classList.remove('form-open');
        this.$noteTitle.style.display = 'none';
        this.$formButtons.style.display = 'none';
        this.$noteTitle.value = '';
        this.$noteText.value = '';
    }

    openModal(event) {
        // prevent modal opening if clicked on .toolbar-delete
        if (event.target.matches('.toolbar-delete')) return;

        // if our click is closest to an object with a class .note, 
        // then we're clicking on it and will open a modal
        if (event.target.closest('.note')) {
            this.$modal.classList.toggle('open-modal');
            this.$modalTitle.value = this.title;
            this.$modalText.value = this.text;
        }
    }

    closeModal(event) {
        this.editNote();
        this.$modal.classList.toggle('open-modal');
    }

    openTooltip(event) {
        // if we're not hovering over toolbar color, return
        if (!event.target.matches('.toolbar-color')) return;
        this.id = event.target.dataset.id;
        // location of tooltip where the user is hovering over
        const noteCoords = event.target.getBoundingClientRect();
        // get pixels
        const horizontal = noteCoords.left + window.scrollX;
        const vertical = noteCoords.top + window.scrollY;
        this.$colorTooltip.style.transform = `translate(${horizontal}px, ${vertical}px)`;
        this.$colorTooltip.style.display = 'flex';
    }

    closeTooltip(event) {
        if (!event.target.matches('.toolbar-color')) return;
        this.$colorTooltip.style.display = 'none';
    }

    addNote({ title, text }) {
        // note object 
        const newNote = {
            title,
            text,
            color: 'white',
            // check if a note exists, get the lenght of last note and add 1 to it
            // if no notes, set id to 1
            id: this.notes.length > 0 ? this.notes[this.notes.length - 1].id + 1 : 1
        }
        // get all previous notes and add new note to them, and directly mutate the existing array 
        this.notes = [...this.notes, newNote];
        console.log(this.notes);
        this.render();
        this.closeForm();
    }

    editNote() {
        // they exist in the inputs
        const title = this.$modalTitle.value;
        const text = this.$modalText.value;
        // iterate thru notes array, check if the ID matches with that of the constructor
        // and then update notes array with values from the modal
        this.notes = this.notes.map(note =>
            note.id === Number(this.id) ? { ...note, title, text } : note
        );
        this.render();
    }

    editNoteColor(color) {
        // same as above, update the color if id matches
        this.notes = this.notes.map(note =>
            note.id === Number(this.id) ? { ...note, color } : note
        );
        this.render();

    }

    selectNote(event) {
        const $selectedNote = event.target.closest('.note'); // clicked-on note
        if (!$selectedNote) return;
        // get title and note from the array of children
        const [$noteTitle, $noteText] = $selectedNote.children;
        // populate title and text with values from the selected note
        this.title = $noteTitle.innerText;
        this.text = $noteText.innerText;
        this.id = $selectedNote.dataset.id;
    }

    deleteNote(event) {
        event.stopPropagation();
        // if not clicking on the .toolbar-delete return
        if (!event.target.matches('.toolbar-delete')) return;
        const id = event.target.dataset.id;
        // filter out all notes except the one with given id
        this.notes = this.notes.filter(note => note.id !== Number(id));
        this.render();
    }

    render() {
        this.saveNotes();
        this.displayNotes();
    }

    saveNotes() {
        localStorage.setItem('notes', JSON.stringify(this.notes));
    }

    displayNotes() {
        //check if we have any notes. If yes, we want to hide the placeholder, otherwise show it.
        const hasNotes = this.notes.length > 0;
        this.$placeholder.style.display = hasNotes ? 'none' : 'flex';

        // to actually display our content, iterate over notes array 
        this.$notes.innerHTML = this.notes.map(note => `
            <div style = "background: ${note.color};" class="note" data-id="${note.id}">
                <div class="${note.title && 'note-title'}">${note.title}</div>
                <div class="note-text">${note.text}</div>
                <div class="toolbar-container">
                    <div class="toolbar">
                        <img class="toolbar-color" data-id="${note.id}" src="images/paint-palette-and-brush.png">
                        <img class="toolbar-delete" data-id="${note.id}" src="images/delete.png">
                    </div>
                </div>
            </div>
        `)
            .join(""); // to get rid of commas during mapping
    }

}

new App();