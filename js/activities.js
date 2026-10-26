
let tweet_array = [];

function parseTweets(runkeeper_tweets) {
    // Do not proceed if no tweets loaded
    if (runkeeper_tweets === undefined) {
        window.alert("No tweets returned");
        return;
    }

    // Convert raw data into Tweet objects
    tweet_array = runkeeper_tweets.map(function(tweet) {
        return new Tweet(tweet.text, tweet.created_at);
    });

    // PART 1: Count activity types

    // Keep completed tweets with recognized activity types
    const completedTweets = tweet_array.filter(tweet =>
        tweet.source === "completed_event" &&
        tweet.activityType !== "unknown"
    );

    const activityCounts = {};

    for (const tweet of completedTweets) {
        const type = tweet.activityType;

        if (activityCounts[type] === undefined) {
            activityCounts[type] = 0;
        }

        activityCounts[type]++;
    }

    // Sort activity types by number of tweets
    const sortedActivities = Object.entries(activityCounts)
        .sort((a, b) => b[1] - a[1]);

    const topThree = sortedActivities.slice(0, 3);
    const topTypes = topThree.map(item => item[0]);

    // Update activity summary
    document.getElementById("numberActivities").innerText =
        sortedActivities.length;

    document.getElementById("firstMost").innerText =
        topThree[0]?.[0] ?? "unknown";

    document.getElementById("secondMost").innerText =
        topThree[1]?.[0] ?? "unknown";

    document.getElementById("thirdMost").innerText =
        topThree[2]?.[0] ?? "unknown";

    console.log("Activity counts:", sortedActivities.slice(0, 15));

    // PART 2: Compare average distances

    const averageDistances = topTypes.map(type => {
        const distances = completedTweets
            .filter(tweet =>
                tweet.activityType === type &&
                tweet.distance > 0
            )
            .map(tweet => tweet.distance);

        const totalDistance = distances.reduce(
            (sum, distance) => sum + distance, 0
        );

        return {
            type: type,
            average: distances.length > 0
                ? totalDistance / distances.length
                : 0
        };
    });

    averageDistances.sort((a, b) => b.average - a.average);

    console.log("Average distances:", averageDistances);

    document.getElementById("longestActivityType").innerText =
        averageDistances[0]?.type ?? "unknown";

    document.getElementById("shortestActivityType").innerText =
        averageDistances[averageDistances.length - 1]?.type ?? "unknown";

    // PART 3: Compare weekdays and weekends

    let weekdayTotal = 0;
    let weekdayCount = 0;
    let weekendTotal = 0;
    let weekendCount = 0;

    for (const tweet of completedTweets) {
        if (!topTypes.includes(tweet.activityType) ||
            tweet.distance <= 0) {
            continue;
        }

        const day = tweet.time.getDay();

        if (day === 0 || day === 6) {
            weekendTotal += tweet.distance;
            weekendCount++;
        } else {
            weekdayTotal += tweet.distance;
            weekdayCount++;
        }
    }

    const weekdayAverage = weekdayCount > 0
        ? weekdayTotal / weekdayCount
        : 0;

    const weekendAverage = weekendCount > 0
        ? weekendTotal / weekendCount
        : 0;

    console.log("Weekday average:", weekdayAverage);
    console.log("Weekend average:", weekendAverage);

    document.getElementById("weekdayOrWeekendLonger").innerText =
        weekendAverage > weekdayAverage ? "weekends" : "weekdays";

    // PART 4: Activity count bar chart

    const activityData = sortedActivities.map(([type, count]) => ({
        activityType: type,
        count: count
    }));

    const activity_vis_spec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Number of tweets for each activity type",

        "data": {
            "values": activityData
        },

        "mark": "bar",

        "encoding": {
            "x": {
                "field": "activityType",
                "type": "nominal",
                "sort": "-y",
                "title": "Activity Type"
            },

            "y": {
                "field": "count",
                "type": "quantitative",
                "title": "Number of Tweets"
            }
        },

        "width": 700,
        "height": 350
    };

    vegaEmbed("#activityVis", activity_vis_spec, {
        actions: false
    }).catch(error => {
        console.error("Unable to display activity chart:", error);
    });

    // PART 5: Prepare individual distance data

    const distanceData = completedTweets
        .filter(tweet =>
            topTypes.includes(tweet.activityType) &&
            tweet.distance > 0
        )
        .map(tweet => ({
            activityType: tweet.activityType,
            distance: tweet.distance,
            day: tweet.time.toLocaleDateString("en-US", {
                weekday: "long"
            })
        }));

    const dayOrder = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    // EXTRA CREDIT: Calculate mean distance data

    const meanData = [];

    for (const type of topTypes) {
        for (const day of dayOrder) {
            const distances = distanceData
                .filter(item =>
                    item.activityType === type &&
                    item.day === day
                )
                .map(item => item.distance);

            if (distances.length > 0) {
                const total = distances.reduce(
                    (sum, distance) => sum + distance, 0
                );

                meanData.push({
                    activityType: type,
                    day: day,
                    distance: total / distances.length
                });
            }
        }
    }

    // EXTRA CREDIT: One Vega-Lite visualization
    // with a dynamically updated data source

    const interactiveSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",

        "description": "Interactive distances using streaming data",

        "data": {
            "name": "activityDistances"
        },

        "mark": {
            "type": "point",
            "opacity": 0.5
        },

        "encoding": {
            "x": {
                "field": "day",
                "type": "ordinal",
                "sort": dayOrder,
                "title": "Day of the Week",

                "axis": {
                    "labelAngle": 0,
                    "labelFontSize": 11,
                    "labelLimit": 100,
                    "titlePadding": 12
                }
            },

            "y": {
                "field": "distance",
                "type": "quantitative",
                "title": "Distance (miles)"
            },

            "color": {
                "field": "activityType",
                "type": "nominal",
                "title": "Activity Type"
            }
        },

        "width": 700,
        "height": 350,

        "padding": {
            "left": 60,
            "right": 30,
            "top": 20,
            "bottom": 50
        },

        "config": {
            "axis": {
                "labelFontSize": 12,
                "titleFontSize": 14
            }
        }
    };

    // Get the existing button and graph containers
    const aggregateButton = document.getElementById("aggregate");
	// Place the button on its own line above the graph
	aggregateButton.style.display = "block";
	aggregateButton.style.marginBottom = "12px";
	
    const distanceContainer = document.getElementById("distanceVis");
    const oldMeanContainer =
        document.getElementById("distanceVisAggregated");

    // Keep the button before the graph
    distanceContainer.parentNode.insertBefore(
        aggregateButton,
        distanceContainer
    );

    // Hide the unused graph container
    oldMeanContainer.style.display = "none";

    let showingMeans = false;

    aggregateButton.innerText = "Show means";
    aggregateButton.disabled = true;

    // Create one view and update its data dynamically
    vegaEmbed("#distanceVis", interactiveSpec, {
        actions: false
    })
        .then(async result => {
            const view = result.view;

            // Load individual distances initially
            await view.change(
                "activityDistances",
                vega.changeset().insert(distanceData)
            ).runAsync();

            aggregateButton.disabled = false;

            // Switch between individual and mean distances
            aggregateButton.addEventListener("click", async function() {
                aggregateButton.disabled = true;

                try {
                    const nextShowingMeans = !showingMeans;

                    const newData = nextShowingMeans
                        ? meanData
                        : distanceData;

                    const changes = vega.changeset()
                        .remove(() => true)
                        .insert(newData);

                    // Update the existing Vega view
                    await view.change(
                        "activityDistances",
                        changes
                    ).runAsync();

                    showingMeans = nextShowingMeans;

                    aggregateButton.innerText =
                        showingMeans ? "Show all" : "Show means";

                } catch (error) {
                    console.error(
                        "Unable to update visualization:",
                        error
                    );
                } finally {
                    aggregateButton.disabled = false;
                }
            });
        })
        .catch(error => {
            console.error(
                "Unable to initialize visualization:",
                error
            );

            aggregateButton.disabled = false;
        });
}

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", function(event) {
    loadSavedRunkeeperTweets().then(parseTweets);
});
