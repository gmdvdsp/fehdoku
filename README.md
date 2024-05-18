# Setup:

1. Install python.
2. Clone this repository with `git clone https://github.com/gmdvdsp/fehdoku.git` to your preferred location.
3. Make a virtual environment for your project.
4. Run `pip install -r requirements.txt`.
5. Run `python app.py` to start the app.
6. Navigate to http://127.0.0.1:5000 to see the app.

# How To Play:

For every cell, you must select a hero such that that hero has the trait listed on its row and column. For example,
the hero selected for this cell must have the special *Chilling Wind* and the weapon *Rexcalibur* in their base kit.

![alt text](https://i.imgur.com/JphnL1W.png)

I'll select it and choose *Yune: Chaos Goddess*.

![alt text](https://i.imgur.com/OejrPGC.png)

Correct!

![alt text](https://i.imgur.com/i0iK30f.png)

You get the gist. You have 9 guesses to play each daily game. After, your score will be calculated based off how
difficult each category was (the fewer options there were, the higher your score!):

![alt text](https://i.imgur.com/QlwiN88.png)

Feel free to select *Past Grids* from the top bar to play the week's games. 

# Future features

Continue development to push towards deployment! Soon, everything will run out of the box without
any setup. Steps before this is done include:

- Choosing a database to store user guesses.
- Choosing a reactive framework and implementing a reactive UI to abet mobile users.
- Add indicators to verify previous games.
- Choosing a hosting service.

And more! Stay tuned!



