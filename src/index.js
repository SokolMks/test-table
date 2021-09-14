import './sass/main.scss';
import '../node_modules/lodash.debounce';
import searchResults from './js/apiService.js';
import tableItem from './templates/table.hbs';
import profileInfo from './templates/profileInfo.hbs';
import stateFilter from './templates/stateFilter.hbs';
import pageButtons from './templates/pagination.hbs';
import api from './api.json';


const tableContent = document.querySelector('.table-content');
const searchInput = document.querySelector('.input-text');
const displayInformation = document.querySelector('.additional-info');
const tableHeaders = document.querySelector('.table-headers');
const selectTag = document.querySelector('.states');
const pagesList = document.querySelector('.pagination ul');
const pageRow = document.querySelector('.pagination');
const searchResult = new searchResults();
const _ = require('lodash');

window.onload = buildTable();
window.onload = createFilters();
window.onload = createButtons();

tableContent.addEventListener('click', displayInfo);
tableHeaders.addEventListener('click', sortInfo);
searchInput.addEventListener('keyup', _.debounce(searchUser, 1000));
selectTag.addEventListener('change', filterByStates);
pagesList.addEventListener('click', changePage);

function pagination(numb = 1) {
  let page = numb;
  const rows = 20;
  const data = api;
  let trimStart = (page - 1) * rows;
  let trimEnd = trimStart + rows;
  let trimmedData = data.slice(trimStart, trimEnd); 
  return {trimmedData};
}

function buildTable(sorted, num) {
  let pageData = pagination(num);
  if(sorted != undefined) {
      tableContent.innerHTML = '';
      tableContent.insertAdjacentHTML('beforeend', tableItem(sorted));
      if(pageRow.classList.contains('visually-hidden')) {
        pageRow.classList.remove('visually-hidden');
      }
      pageRow.classList.add('visually-hidden');
  } else {
    if(pageRow.classList.contains('visually-hidden')) {
        pageRow.classList.remove('visually-hidden');
      }
    tableContent.innerHTML = '';
    tableContent.insertAdjacentHTML('beforeend', tableItem(pageData.trimmedData));
  }
}

function displayInfo(e) {
  clearHtml();
  const itemId = parseInt(e.target.parentNode.id);
  searchResult.fetchResult().then(response => {
    const requiredItem = response.find(required => required.id === itemId);
    displayInformation.insertAdjacentHTML('beforeend', profileInfo(requiredItem));
  });
}

function sortInfo(e) {
  const column = e.target.dataset.column;
  const order = e.target.dataset.order;
  let changeData = e.target;
  
  if(order === 'desc') {
    changeData.setAttribute('data-order', 'asc');
    searchResult.fetchResult().then(response => {
     response.sort((a,b) => a[column] > b[column] ? 1 : -1);
      buildTable(response);
    })
  } else {
    changeData.setAttribute('data-order', 'desc');
    searchResult.fetchResult().then(response => {
      response.sort((a,b) => a[column] < b[column] ? 1 : -1);
      buildTable(response);
    })
  }
}

function searchUser(e) {
  const searchInput = e.target.value.toLowerCase();
  const apiResult = searchResult.fetchResult();
  
  apiResult.then(datas => {
    let filteredApi = [];
    for (let data of datas) {
      let searchingData = data.firstName.toLowerCase();
      
      if(searchingData.includes(searchInput)) {
        filteredApi.push(data);
      } 
    }
    if (filteredApi.length === 0) {
      window.alert("There are no such names, please try again");
      buildTable();
    } else {
      buildTable(filteredApi);
    }   
  });  
}

function createFilters() {
  searchResult.fetchResult().then(response => {
    let states =[];
    for(let item of response) {
      states.push(item.adress.state);
    }
    let uniqueStates = states.filter((c, index) => {
      return states.indexOf(c) === index;
    });
    uniqueStates.sort();
    selectTag.insertAdjacentHTML('beforeend', stateFilter(uniqueStates));
  })
}

function filterByStates(e) {
  const selectOption = e.target.value;
  const apiResult = searchResult.fetchResult();
  apiResult.then(datas => {
    let selectedOption = [];
    for(let data of datas) {
      let state = data.adress.state;
      if(selectOption === state) {
        selectedOption.push(data);
      }
    }
    console.log(selectOption.length);
    if(selectOption.length === 0) {
      buildTable();
    } else {
      buildTable(selectedOption);
    }
  });
}

function createButtons() {
  pagesList.innerHTML = '';
  searchResult.fetchResult().then(response => {
    let pages = response.length / 20;
    for(let i = 1; i <= pages; i++){
      pagesList.insertAdjacentHTML('beforeend', pageButtons(i));
    }
  })
  
}

function changePage(e) {
  if(typeof(e.target.value) === "string"){
    buildTable(undefined, e.target.value);
  } 
}




function clearHtml() {
  displayInformation.innerHTML = '';
}

