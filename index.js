'use strict';

const recipeSearchAPIid='2a499952';
const recipeSearchAPIkey='c5e68ccb26db262d07a7a350a3573cc0';
const recipeSearchURL='https://api.edamam.com/search';
const imgRecognitionAPIkey = '7e9e51c5562243fc8f358186afb8c93a';

//const Clarifai=require('clarifai');
//const app = new Clarifai.App({apiKey: '7e9e51c5562243fc8f358186afb8c93a'});
const appID= 'dc5ab558a2024361b516bdb793651649';
const workflowVersion = 'dfebc169854e429086aceb8368662';
const modelID='bd367be194cf45149e75f01d59f77ba7';
const imgRecognitionURL = 'https://api.clarifai.com/v2/models/{THE_MODEL_ID}/outputs';
const personalAccess = '739135542f1a4cf690810856c1fada5b';
//app.models.predict(modelID,input).then()
function getKeywords(imageUrl){
    const url = `https://api.clarifai.com/v2/models/${modelID}/versions/${workflowVersion}outputs`
    fetch(url, {body:{
        "image": {
          "url": imageUrl,
          "allow_duplicate_url": true}},
          headers: {"Authorization": "7e9e51c5562243fc8f358186afb8c93a",
        "Content-Type":"application/json"}}
        ).then(response => {
            if (response.ok) {
              return response.json();
            }
            throw new Error(response.statusText);
          })
          .then(responseJson => console.log(responseJson))
          .catch(err => {
            $('#js-error-message').text(`Something went wrong: ${err.message}`);
          });
};
function formatQueryParams(params) {
    const queryItems = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
};

function getRecipe(keyword, maxResults){
    const params = {
        q: keyword,
        app_id: '2a499952',
        app_key:'c5e68ccb26db262d07a7a350a3573cc0',
        to: maxResults
      };
      const queryString = formatQueryParams(params)
      const url = recipeSearchURL + '?' + queryString;
      const proxyurl = "https://cors-anywhere.herokuapp.com/";

      console.log(url);
      fetch(proxyurl+url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayResults(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
};
function displayResults(responseJson){
    // if there are previous results, remove them
  console.log(responseJson);
  $('#results-list').empty();
  // iterate through the items array
  for (let i = 0; i < responseJson.to; i++){
    // for each video object in the items 
    //array, add a list item to the results 
    //list with the video title, description,
    //and thumbnail
    $('#results-list').append(
      `<li><h3>${responseJson.hits[i].recipe.label}</h3>
      <img src='${responseJson.hits[i].recipe.image}'>
      <p>${responseJson.hits[i].recipe.ingredientLines}</p>
      <a href=${responseJson.hits[i].recipe.url}>link for detail instruction</a>
      
      </li>`
    )};
  //display the results section  
  $('#results').removeClass('hidden');

};
function watchForm() {
    $('form').submit(event => {
      event.preventDefault();
      const searchTerm = $('#js-search-term').val();
      const searchURL = $('#js-search-url').val();
      const maxResults = $('#js-max-results').val();
      getRecipe(searchTerm,maxResults)
      getKeywords(searchURL)
    });
  }
  
  $(watchForm);