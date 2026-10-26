let writtenTweets = [];

function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	//TODO: Filter to just the written tweets
	// Convert raw tweet data into Tweet objects
	const tweets = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	// Keep only tweets containing user-written text
	writtenTweets = tweets.filter(function(tweet) {
		return tweet.written;
	});

	console.log("User-written tweets:", writtenTweets.length);
}

function addEventHandlerForSearch() {
	//TODO: Search the written tweets as text is entered into the search box, and add them to the table
    const searchBox = document.getElementById("textFilter");

    searchBox.addEventListener("input", function () {
        const searchText = searchBox.value.trim().toLowerCase();

        // Find matching tweets
        const matchingTweets = searchText === ""
            ? []
            : writtenTweets.filter(tweet =>
                tweet.writtenText.toLowerCase().includes(searchText)
            );

        // Update the search summary
        document.getElementById("searchCount").innerText =
            matchingTweets.length;

        document.getElementById("searchText").innerText =
            searchBox.value;

		// Display matching tweets in the table
		// Display matching tweets in the table
		const tweetTable = document.getElementById("tweetTable");

		// Build all rows first, then update the table only once
		const rowsHTML = matchingTweets
			.map((tweet, index) => tweet.getHTMLTableRow(index + 1))
			.join("");

		tweetTable.innerHTML = rowsHTML;

    });
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});