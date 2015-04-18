This is supposed to ultimately create a bash script that would regularily push commits to a [dummy?] github account. The timing of the commits will reproduce the contributions history pattern drawn onto the canvas.


Some ideas for the next steps:

- Research: Can we retroactively fill the pattern by editing commit dates and then pushing it? Does the "activity" date correspond to date pushed or date committed?
- Import from github public user profile (parse some html (svg))
- Instead of just having a dummy account to push this to, let's use our active github account. Here are some ideas:
	- Check the max #contributions in the past year, double it. Assume that for the next year, we won't surpass that threshold on any given day. Generate script which runs daily. The script checks today's #contributions, and makes the appropriate number of dummy commits required to match the pattern.
	- Generate a script that schedules pushing your local commits. It schedules the pushes in order to match the pattern. Warns you when you don't have enough backlog. This depends on the research question (first point).
	- Generate a script that uses the beeminder API (dial-it-in) to create a yellow brick road (+akrasia horizon offset). If the YBR is followed accurately, it would match the selected pattern. It can either be the users's responsiblity to match it, or we can use the hypothetical script described in the previous point.
