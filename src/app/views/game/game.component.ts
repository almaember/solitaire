import { Component, OnInit } from "@angular/core";
import { CardsService } from "src/app/services/cards.service";
import { Card } from "src/app/model/card";

@Component({
  selector: "app-game",
  templateUrl: "./game.component.html",
  styleUrls: ["./game.component.scss"],
})
export class GameComponent implements OnInit {
  stock: Card[] = [];
  talon: Card[] = []; // waste
  tableau: [Card[]] = Array.apply(null, Array(7)).map(function () {
    return [];
  });
  foundations: [Card[]] = Array.apply(null, Array(4)).map(function () {
    return [];
  });

  constructor(private cardService: CardsService) { }

  ngOnInit() {
    this.cardService.cards.subscribe((deck) => {
      createTableau(deck);
    });

    const createTableau = (deck: Card[]) => {
      this.stock = deck;

      for (let i = 0; i < this.tableau.length; i += 1) {
        for (let j = 0; j < i + 1; j += 1) {
          const dealtCard = this.stock.pop();

          // Last card is visible in each tableau column
          if (i === j) {
            dealtCard.visible = true;
          }

          this.tableau[i].push(dealtCard);
        }
      }
    };
  }

  flipACardFromAStock() {
    const flippedCard = this.stock.pop();
    flippedCard.visible = true;
    this.talon.push(flippedCard);
  }

  onCardDragged(event, card: Card, tableauColumnIndexOfDraggedCard?: number) {
    event.dataTransfer.setData("card", JSON.stringify(card));
    event.dataTransfer.setData("tableauColumnIndex", tableauColumnIndexOfDraggedCard);
  }

  dropToFoundation(event) {
    event.preventDefault();

    const card: Card = JSON.parse(event.dataTransfer.getData("card"));
    const fromTableauColumnIndex: number | undefined = parseInt(event.dataTransfer.getData("tableauColumnIndex"));
    const toFoundationIndex: number = parseInt(event.target.id);

    this.validateFoundation(card, toFoundationIndex, fromTableauColumnIndex);
  }

  dropToTableauColumn(event, toTableauColumnIndex: number) {
    event.preventDefault();

    const card: Card = JSON.parse(event.dataTransfer.getData("card"));
    const fromTableauColumnIndex: number | undefined = parseInt(event.dataTransfer.getData("tableauColumnIndex"));
    this.validateTableau(card, toTableauColumnIndex, fromTableauColumnIndex);
  }

  allowDrop(event) {
    event.preventDefault();
  }

  setLastTableauColumnCardToVisible(card: Card, isLast: boolean) {
    if (isLast) {
      card.visible = true;
    }
  }

  onReuseTalon() {
    // TODO:
    // Itt azt kell csinálni, hogy a felfordított talonból a lapok sorrendjét megcserélem 
    // Utána pedig visible false mindre
    this.stock = this.talon;
    this.talon = [];
  }

  private validateFoundation(card: Card, toFoundationIndex: number, fromTableauColumnIndex: number | undefined) {
    const increasing = this.foundations[toFoundationIndex].length + 1 === card.value;
    const foundationIsNotEmpty = this.foundations[toFoundationIndex].length !== 0;
    let cardTypeIdentical: boolean;

    if (foundationIsNotEmpty) {
      cardTypeIdentical = this.foundations[toFoundationIndex][0].type === card.type;
    } else {
      cardTypeIdentical = true;
    }

    if (increasing && cardTypeIdentical) {
      this.foundations[toFoundationIndex].push(card);
      this.cleanupAfterCardIsPlaced(fromTableauColumnIndex);
    }
  }

  private validateTableau(card: Card, toTableauColumnIndex: number, fromTableauColumnIndex: number | undefined) {
    const lastCardInTheTableauColumn = this.tableau[toTableauColumnIndex][this.tableau[toTableauColumnIndex].length - 1];
    const decreasing = lastCardInTheTableauColumn.value - 1 === card.value;
    const mismatchColor = lastCardInTheTableauColumn.color !== card.color;

    if (decreasing && mismatchColor) {
      this.tableau[toTableauColumnIndex].push(card);
      this.cleanupAfterCardIsPlaced(fromTableauColumnIndex);
    }
  }

  private cleanupAfterCardIsPlaced(fromTableauColumnIndex: number | undefined) {
    if (!isNaN(fromTableauColumnIndex)) { // If the card is lifted from a tableau column
      this.removeTopCardFromTableauColumn(fromTableauColumnIndex);
    } else { // If the card is lifted from a talon
      this.removeTopCardFromTalon();
    }
  }

  private removeTopCardFromTableauColumn = (tableauColumnIndex: number) => this.tableau[tableauColumnIndex].pop();

  private removeTopCardFromTalon = () => this.talon.pop();
}
