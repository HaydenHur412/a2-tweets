class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {
        //TODO: identify whether the source is a live event, an achievement, a completed event, or miscellaneous.
        const text = this.text.toLowerCase();

        if (text.startsWith("just completed") ||
            text.startsWith("just posted") ||
            text.startsWith("completed a")) {
            return "completed_event";
        }

        if (text.startsWith("watch my run") ||
            text.includes("#rklive")) {
            return "live_event";
        }

        if (text.startsWith("achieved") ||
            text.startsWith("i just set a goal")) {
            return "achievement";
        }

        return "miscellaneous";
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written(): boolean {
    return this.writtenText.length > 0;
    }

    get writtenText(): string {
        // Remove URLs and the RunKeeper hashtag
        let cleaned = this.text
            .replace(/https?:\/\/\S+/g, "")
            .replace(/#RunKeeper/gi, "")
            .trim();

        // Remove the default RunKeeper message
        cleaned = cleaned
            .replace(/with @Runkeeper\. Check it out!/gi, "")
            .trim();

        // Find user-added text after " - "
        const separator = cleaned.indexOf(" - ");

        if (separator === -1) {
            return "";
        }

        const userText = cleaned.substring(separator + 3).trim();

        // Ignore another common automatically generated phrase
        if (userText === "TomTom MySports Watch") {
            return "";
        }

        return userText;
    }

    get activityType(): string {
        if (this.source !== "completed_event") {
            return "unknown";
        }

        const match = this.text.match(
            /^(?:Just (?:completed|posted)|Completed) (?:a|an) (?:\d+(?:\.\d+)?\s*(?:km|mi)\s+)?(.+?)(?=\s+(?:with|in|-\s|https?:\/\/)|$)/i
        );

        if (match) {
            let activity = match[1].trim().toLowerCase();

            // Remove speed information from activity names
            activity = activity.replace(/\s*@\s*[\d.]+\s*km\/h.*$/i, "");

            // Remove the TomTom MySports prefix
            activity = activity.replace(/^mysports\s+/i, "");

            return activity.trim();
        }

        return "unknown";
    }

    get distance(): number {
        if (this.source !== "completed_event") {
            return 0;
        }

        const match = this.text.match(
            /^Just (?:completed|posted) (?:a|an) (\d+(?:\.\d+)?)\s*(km|mi)\b/i
        );

        if (!match) {
            return 0;
        }

        const distance = parseFloat(match[1]);
        const unit = match[2].toLowerCase();

        if (unit === "km") {
            return distance / 1.609;
        }

        return distance;
    }

    getHTMLTableRow(rowNumber: number): string {
        // Escape special HTML characters
        const escapeHTML = (text: string): string => {
            return text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        };

        // Convert URLs in the tweet into clickable links
        const tweetHTML = this.text
            .split(/(https?:\/\/[^\s]+)/g)
            .map(part => {
                if (/^https?:\/\//i.test(part)) {
                    const url = escapeHTML(part);

                    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
                }

                return escapeHTML(part);
            })
            .join("");

        return `
            <tr>
                <td>${rowNumber}</td>
                <td>${escapeHTML(this.activityType)}</td>
                <td>${tweetHTML}</td>
            </tr>
        `;
    }
}