function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	
	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById('numberTweets').innerText = tweet_array.length;	

	// Find the earliest and latest tweet dates
	let earliestDate = tweet_array[0].time;
	let latestDate = tweet_array[0].time;

	for (let tweet of tweet_array) {
		if (tweet.time < earliestDate) {
			earliestDate = tweet.time;
		}

		if (tweet.time > latestDate) {
			latestDate = tweet.time;
		}
	}

	// Format dates as Weekday, Month Day, Year
	let dateOptions = {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	};

	// Update the webpage
	document.getElementById('firstDate').innerText =
		earliestDate.toLocaleDateString('en-US', dateOptions);

	document.getElementById('lastDate').innerText =
		latestDate.toLocaleDateString('en-US', dateOptions);

	// Count tweets by category
	let completed = 0;
	let live = 0;
	let achievements = 0;
	let miscellaneous = 0;

	for (let tweet of tweet_array) {
		if (tweet.source === "completed_event") {
			completed++;
		} else if (tweet.source === "live_event") {
			live++;
		} else if (tweet.source === "achievement") {
			achievements++;
		} else {
			miscellaneous++;
		}
	}

	// Calculate percentages
	const total = tweet_array.length;

	function percentage(count) {
		return (count / total * 100).toFixed(2) + "%";
	}

	// Update the webpage
	document.querySelectorAll(".completedEvents").forEach(el => {
		el.innerText = completed;
	});
	document.querySelector(".completedEventsPct").innerText = percentage(completed);

	document.querySelector(".liveEvents").innerText = live;
	document.querySelector(".liveEventsPct").innerText = percentage(live);

	document.querySelector(".achievements").innerText = achievements;
	document.querySelector(".achievementsPct").innerText = percentage(achievements);

	document.querySelector(".miscellaneous").innerText = miscellaneous;
	document.querySelector(".miscellaneousPct").innerText = percentage(miscellaneous);

	// Count completed tweets with user-written text
	let writtenCount = 0;

	for (let tweet of tweet_array) {
		if (tweet.source === "completed_event" && tweet.written) {
			writtenCount++;
		}
	}

	// Percentage of completed tweets with written text
	let writtenPercentage = completed > 0
		? (writtenCount / completed * 100).toFixed(2) + "%"
		: "0.00%";

	// Update the webpage
	document.querySelector(".written").innerText = writtenCount;
	document.querySelector(".writtenPct").innerText = writtenPercentage;

}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});