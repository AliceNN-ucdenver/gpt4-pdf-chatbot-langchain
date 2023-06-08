import * as diff from 'diff';

function redlines(oldString: string, newString: string): string {
    let difference = diff.diffWords(oldString, newString);

    let result = '';

    difference.forEach((part) => {
        // green for additions, red for deletions
        // grey for common parts
        let color = part.added ? 'green' :
            part.removed ? 'red' : 'grey';

        let text = part.value;

        // add markdown syntax for color
        switch(color) {
            case 'green':
                text = `**${text}**`;
                break;
            case 'red':
                text = `~~${text}~~`;
                break;
        }

        result += text;
    });

    return result;
}

export default redlines;