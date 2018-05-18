//Global variables
$(document).ready(function() {

    //audio clips
    let audio = new Audio('assets/audio/themesong.mp3');
    let loser = new Audio('assets/audio/loser.mp3');
    let afterattack = new Audio('assets/audio/afterattack.mp3');
    let winner = new Audio('assets/audio/winner.mp3');
    let ponyattack = new Audio('assets/audio/ponyattack.mp3');
    let nopony = new Audio('assets/audio/nopony.mp3');
    
    //Array of Playable Characters
    let characters = {
        'Twlight': {
            name: 'Twlight',
            health: 120,
            attack: 8,
            imageUrl: "assets/images/twlight.png", 
            enemyAttackBack: 15
        }, 
        'Rarity': {
            name: 'Rarity',
            health: 100,
            attack: 14,
            imageUrl: "assets/images/rarity.png",
            enemyAttackBack: 5
        }, 
        'Fluttershy': {
            name: 'Fluttershy',
            health: 150,
            attack: 8,
            imageUrl: "assets/images/Fluttershy.png",
            enemyAttackBack: 20
        }, 
        'RainbowDash': {
            name: 'RainbowDash',
            health: 180,
            attack: 7,
            imageUrl: "assets/images/RainbowDash.png",
            enemyAttackBack: 20
        }
    };
    
    var currSelectedCharacter;
    var currDefender;
    var combatants = [];
    var indexofSelChar;
    var attackResult;
    var turnCounter = 1;
    var killCount = 0;
    
    
    var renderOne = function(character, renderArea, makeChar) {
        //character: obj, renderArea: class/id, makeChar: string
        var charDiv = $("<div class='character' data-name='" + character.name + "'>");
        var charName = $("<div class='character-name'>").text(character.name);
        var charImage = $("<img alt='image' class='character-image'>").attr("src", character.imageUrl);
        var charHealth = $("<div class='character-health'>").text(character.health);
        charDiv.append(charName).append(charImage).append(charHealth);
        $(renderArea).append(charDiv);
        //Capitalizes the first letter in characters name
        // $('.character').css('textTransform', 'capitalize');
        // conditional render
        if (makeChar == 'enemy') {
          $(charDiv).addClass('enemy');
        } else if (makeChar == 'defender') {
          currDefender = character;
          $(charDiv).addClass('target-enemy');
        }
      };
    
      // Create function to render game message to DOM
      var renderMessage = function(message) {
        var gameMesageSet = $("#gameMessage");
        var newMessage = $("<div>").text(message);
        gameMesageSet.append(newMessage);
    
        if (message == 'clearMessage') {
          gameMesageSet.text('');
        }
      };
    
      var renderCharacters = function(charObj, areaRender) {
        //render all characters
        if (areaRender == '#characters-section') {
          $(areaRender).empty();
          for (var key in charObj) {
            if (charObj.hasOwnProperty(key)) {
              renderOne(charObj[key], areaRender, '');
            }
          }
        }
        //render player character
        if (areaRender == '#selected-character') {
          $('#selected-character').prepend("Your Character");       
          renderOne(charObj, areaRender, '');
          $('#attack-button').css('visibility', 'visible');
        }
        //render combatants
        if (areaRender == '#available-to-attack-section') {
            $('#available-to-attack-section').prepend("Choose the next to be friend!");      
          for (var i = 0; i < charObj.length; i++) {
    
            renderOne(charObj[i], areaRender, 'enemy');
          }
          //render one enemy to defender area
          $(document).on('click', '.enemy', function() {
            //select an combatant to fight
            name = ($(this).data('name'));
            //if defernder area is empty
            if ($('#defender').children().length === 0) {
              renderCharacters(name, '#defender');
              $(this).hide();
              renderMessage("clearMessage");
            }
          });
        }
        //render defender
        if (areaRender == '#defender') {
          $(areaRender).empty();
          for (var i = 0; i < combatants.length; i++) {
            //add enemy to defender area
            if (combatants[i].name == charObj) {
              $('#defender').append("Your selected opponent")
              renderOne(combatants[i], areaRender, 'defender');
            }
          }
        }
        //re-render defender when attacked
        if (areaRender == 'playerDamage') {
          $('#defender').empty();
          $('#defender').append("Your selected opponent")
          renderOne(charObj, '#defender', 'defender');
          ponyattack.play();
        }
        //re-render player character when attacked
        if (areaRender == 'enemyDamage') {
          $('#selected-character').empty();
          renderOne(charObj, '#selected-character', '');
        }
        //render defeated enemy
        if (areaRender == 'enemyDefeated') {
          $('#defender').empty();
          var gameStateMessage = "You have befriended " + charObj.name + ", you can choose to friend another pony.";
          renderMessage(gameStateMessage);
          afterattack.play();
        }
      };
      //this is to render all characters for user to choose their computer
      renderCharacters(characters, '#characters-section');
      $(document).on('click', '.character', function() {
        name = $(this).data('name');
        //if no player char has been selected
        if (!currSelectedCharacter) {
          currSelectedCharacter = characters[name];
          for (var key in characters) {
            if (key != name) {
              combatants.push(characters[key]);
            }
          }
          $("#characters-section").hide();
          renderCharacters(currSelectedCharacter, '#selected-character');
          //this is to render all characters for user to choose fight against
          renderCharacters(combatants, '#available-to-attack-section');
        }
      });
    
      // ----------------------------------------------------------------
      // Create functions to enable actions between objects.
      $("#attack-button").on("click", function() {
        //if defernder area has enemy
        if ($('#defender').children().length !== 0) {
          //defender state change
          var attackMessage = "You hugged " + currDefender.name + " for " + (currSelectedCharacter.attack * turnCounter) + " love points.";
          renderMessage("clearMessage");
          //combat
          currDefender.health = currDefender.health - (currSelectedCharacter.attack * turnCounter);
    
          //win condition
          if (currDefender.health > 0) {
            //enemy not dead keep playing
            renderCharacters(currDefender, 'playerDamage');
            //player state change
            var counterAttackMessage = currDefender.name + " pushed you back for " + currDefender.enemyAttackBack + " grumpy points.";
            renderMessage(attackMessage);
            renderMessage(counterAttackMessage);
    
            currSelectedCharacter.health = currSelectedCharacter.health - currDefender.enemyAttackBack;
            renderCharacters(currSelectedCharacter, 'enemyDamage');
            if (currSelectedCharacter.health <= 0) {
              renderMessage("clearMessage");
              restartGame("You didn't make friends with all...GAME OVER!!!");
              loser.play();
              $("#attack-button").unbind("click");
            }
          } else {
            renderCharacters(currDefender, 'enemyDefeated');
            killCount++;
            if (killCount >= 3) {
              renderMessage("clearMessage");
              restartGame("You made all the friends!!!! GAME OVER!!!");
              winner.play();
              // Play pony theme:
              setTimeout(function() {
              audio.play();
              }, 2000);
    
            }
          }
          turnCounter++;
        } else {
          renderMessage("clearMessage");
          renderMessage("No Pony here.");
          nopony.play();
        }
      });
    
    //Restarts the game - renders a reset button
      var restartGame = function(inputEndGame) {
        //When 'Restart' button is clicked, reload the page.
        var restart = $('<button class="btn">Restart</button>').click(function() {
          location.reload();
        });
        var gameState = $("<div>").text(inputEndGame);
        $("#gameMessage").append(gameState);
        $("#gameMessage").append(restart);
      };
    
    });