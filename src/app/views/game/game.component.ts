import { Component, OnDestroy, OnInit } from '@angular/core';
import { CardsService } from 'src/app/services/cards.service';
import { Card } from 'src/app/model/card';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {
  stock: Card[];
  talon: Card[] = []; 
  tableau: [Card[]] = Array.apply(null, Array(7)).map(function () {return []})
  foundations: [Card[]] = Array.apply(null, Array(4)).map(function () {return []});

  constructor(private cardService : CardsService) { }

  ngOnInit() {
    this.cardService.cards.subscribe(deck => {      
      createTableau(deck);
    });
    
    const createTableau = (deck: Card[]) => {     
      this.stock = deck;

      for (let i = 0; i < this.tableau.length; i += 1) {
        for (let j = 0; j < i + 1 ; j += 1) {         

          const dealtCard = this.stock.pop();

          this.tableau[i].push(dealtCard);          
        };
      };  

    };
    
  }

  ngOnDestroy() {

  }

  flipACardFromAStock(){   
    const flippedCard = this.stock.pop();
    this.talon.push(flippedCard);
  }

  drag(event, card: Card) {    
    event.dataTransfer.setData("card", JSON.stringify(card));
  }

  drop(event) {    
    event.preventDefault();    
    const card: Card = JSON.parse(event.dataTransfer.getData("card"));  
    const foundationIndex: number = event.target.id;
    console.log("foundation INDEX", foundationIndex);
    this.validateFoundation(foundationIndex, card);    
  }

  allowDrop(event) {
    event.preventDefault();
  }

  validateFoundation(foundationIndex: number, card: Card) {
    if(this.foundations[foundationIndex].length + 1 === card.value){
      this.foundations[foundationIndex].push(card);
    }      
  }
}
