'use strict';
//list of key and url for APIs
const recipeSearchAPIid='2a499952';
const recipeSearchAPIkey='c5e68ccb26db262d07a7a350a3573cc0';
const recipeSearchURL='https://api.edamam.com/search';
const imgRecognitionAPIkey = '7e9e51c5562243fc8f358186afb8c93a';
//const appID= 'dc5ab558a2024361b516bdb793651649';
//const workflowVersion = 'dfebc169854e429086aceb8368662';
const modelID='bd367be194cf45149e75f01d59f77ba7';
const imgRecognitionURL = `https://api.clarifai.com/v2/models/${modelID}/outputs`;
//function to generate a list of keywords
function displayKeywords(responseJson, maxResults,searchTerm){
  const keywords = [];
  //set as 5 because too many keywords will return no result
  for (let i = 0; i < 5; i++){
    keywords[i] = responseJson.outputs[0].data.concepts[i].name;
}
  keywords.push(searchTerm)
const stringKeywords = keywords.join(',');
//showing user the keywords extracted from their image
$('#js-search-term').val(stringKeywords)
getRecipe(stringKeywords,maxResults);
};

//function to call image recongition api and return keywords
function getKeywords(imageUrl, maxResults,searchTerm){
  var settings = {
    "url": imgRecognitionURL,
    "method": "POST",
    "timeout": 0,
    "headers": {
      "Authorization": `Key ${imgRecognitionAPIkey}`,
      "Content-Type": "application/json"
    },
    "data": JSON.stringify({"inputs":[{"data":{"image":{"url":`${imageUrl}`}}}]}),
  };
  $.ajax(settings).done(response => {
      return response.json();
  }).then(responseJson => displayKeywords(responseJson,maxResults,searchTerm))
  .catch(err => {
    $('#js-error-message').text(`Something went wrong ${err.message}`);
});
};
//a function to use return keyword string to search for recipe. 
function imageRecipeSearch(imageUrl, maxResults, searchTerm){
  getKeywords(imageUrl,maxResults, searchTerm)
};
//a function to format params from object to string
function formatQueryParams(params) {
    const queryItems = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
};
//function to perform recipe search base on keyword
function getRecipe(keyword, maxResults){
    const params = {
        q: keyword,
        app_id: `${recipeSearchAPIid}`,
        app_key:`${recipeSearchAPIkey}`,
        to: maxResults
      };
      const queryString = formatQueryParams(params)
      const url = recipeSearchURL + '?' + queryString;
      fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayResults(responseJson, maxResults))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong! ${err.message}`);
    });
};
//a function to append the list
function generateList(array,ID,x){
  $(`#${ID}`).append('<h4>Ingredient List: </h4>')
  for (let x = 0; x<array.length;x++)
  {
      $(`#${ID}`).append(
        `<li>${array[x]}</li>`
      )
  }
};
//function to display results from recipe search
function displayResults(responseJson,maxResults){
    // if there are previous results, remove them
  $('#results-list').empty();
  //check if there is any recipe return
  if(responseJson.count == 0){
    $('#results').removeClass('hidden');
    return $('#results-list').append('Sorry, Nothing is found! Please try reducing or change your keywords')
  }
  // iterate through the items array, show 6 at the beginning 
  if (maxResults>6) {
    for (let i = 0; i < 6; i++){
    // for each video object in the items 
    const currentID = "list" + i;  
    $('#results-list').append(
      `<li class="item" id='${currentID}'><h3>${responseJson.hits[i].recipe.label}</h3>
      <img src='${responseJson.hits[i].recipe.image}'>
      <br>
      <a href='${responseJson.hits[i].recipe.url}' target="_blank">link for detail instruction</a>
      </li>`
    )
    generateList(responseJson.hits[i].recipe.ingredientLines, currentID, i)
  };
  $('#moreResults').append('<button id = "load" class="loadMore">Load More</button>');
  loadMoreResults(responseJson);
  } 
  // if maxRessults is less than 6, it will all display at once, no load more button
  else {
    for (let i = 0; i < maxResults; i++){
      // for each video object in the items 
      const currentID = "list" + i;  
      $('#results-list').append(
        `<li class="item" id='${currentID}'> <h3>${responseJson.hits[i].recipe.label}</h3>
        <img src='${responseJson.hits[i].recipe.image}' alt='${responseJson.hits[i].recipe.label}'>
        <br>
        <a href='${responseJson.hits[i].recipe.url}' target="_blank">link for detail instruction</a>
        </li>`
      )
      generateList(responseJson.hits[i].recipe.ingredientLines, currentID, i)
    };
  };
   //display the results section  
  $('#results').removeClass('hidden');
};
//function for listening the loadMore Btn
function loadMoreResults(responseJson){
  $('.loadMore').on("click", event =>{
    for (let j = 6; j < responseJson.to; j++){
      // for each video object in the items 
      //array, add a list item to the results 
      //list with the video title, description,
      //and thumbnail
      //create id for each
      const currentIDj = "listj" + j;  
      $('#results-list').append(
        `<li class="item" id='${currentIDj}'><h3>${responseJson.hits[j].recipe.label}</h3>
        <img src='${responseJson.hits[j].recipe.image}' alt='${responseJson.hits[j].recipe.label}'>
        <br>
        <a href='${responseJson.hits[j].recipe.url}' target="_blank">link for detail instruction</a>
        </li>`
      )
      //call function to append ingredient list
      generateList(responseJson.hits[j].recipe.ingredientLines, currentIDj, j)
    };
    const v = document.getElementById("load");
    v.classList.add("hidden")
  }) 
};
  //controlling the display input from radio button
function radioBtn(radio){
  switch (radio.value)
    {
        case "insertWord":
            $('#searchWord').removeClass('hidden');
            $("#searchURL").addClass('hidden');
            break;
        case "insertURL":
            $("#searchURL").removeClass('hidden');
            $('#searchWord').addClass('hidden');
            break;
    }
}
//call back function
function watchForm() {
  //controlling the display input from radio button
    radioBtn(radio)

    $('form').submit(event => {
      event.preventDefault();
      const searchTerm = $('#js-search-term').val();
      const searchURL = $('#js-search-url').val();
      const maxResults = $('#js-max-results').val();
      //clearing previous results
      $('#moreResults').html('')
      //clearing url field
      $('#js-search-url').val('')
      if(searchTerm && !searchURL){
        getRecipe(searchTerm,maxResults)
      }
      else if(!searchTerm && searchURL){
        imageRecipeSearch(searchURL, maxResults,searchTerm)
      }
      else if(searchURL && searchTerm){
        getKeywords(searchURL, maxResults,searchTerm)
        $('#js-error-message').append('We are combining your search keywords and output from the image')
      }
      else{'invalid'}
    });
};
//load function  
$(watchForm);