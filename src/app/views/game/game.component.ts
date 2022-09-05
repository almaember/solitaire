import { Component, OnInit } from "@angular/core";
import { CardsService } from "src/app/services/cards.service";
import { Card } from "src/app/model/card";

@Component({
  selector: "app-game",
  templateUrl: "./game.component.html",
  styleUrls: ["./game.component.scss"],
})
export class GameComponent implements OnInit {
  stock: Card[];
  talon: Card[] = [];
  tableau: [Card[]] = Array.apply(null, Array(7)).map(function () {
    return [];
  });
  foundations: [Card[]] = Array.apply(null, Array(4)).map(function () {
    return [];
  });

  constructor(private cardService: CardsService) {}

  ngOnInit() {
    this.cardService.cards.subscribe((deck) => {
      createTableau(deck);
    });

    const createTableau = (deck: Card[]) => {
      this.stock = deck;

      for (let i = 0; i < this.tableau.length; i += 1) {
        for (let j = 0; j < i + 1; j += 1) {
          const dealtCard = this.stock.pop();

          this.tableau[i].push(dealtCard);
        }
      }
    };
  }

  flipACardFromAStock() {
    const flippedCard = this.stock.pop();
    this.talon.push(flippedCard);
  }

  drag(event, card: Card, tableauColumnIndex: number) {
    event.dataTransfer.setData("card", JSON.stringify(card));
    event.dataTransfer.setData("tableauColumnIndex", tableauColumnIndex);
  }

  dropToFoundation(event) {
    event.preventDefault();

    const card: Card = JSON.parse(event.dataTransfer.getData("card"));
    const tableauColumnIndex: number = parseInt(
      event.dataTransfer.getData("tableauColumnIndex")
    );
    const foundationIndex: number = parseInt(event.target.id);

    this.validateFoundation(foundationIndex, card, tableauColumnIndex);
  }

  dropToTableauColumn(event, tableauColumnIndex: number) {
    event.preventDefault();
    const card: Card = JSON.parse(event.dataTransfer.getData("card"));
    this.validateTableau(tableauColumnIndex, card);
  }

  allowDrop(event) {
    event.preventDefault();
  }

  removeTopCardFromTableauColumn = (tableauColumnIndex: number) =>
    this.tableau[tableauColumnIndex].pop();

  removeTopCardFromTalon = () => this.talon.pop();

  validateFoundation(
    foundationIndex: number,
    card: Card,
    tableauColumnIndex?: number
  ) {
    const increasing: boolean =
      this.foundations[foundationIndex].length + 1 === card.value;
    const foundationIsNotEmpty: boolean =
      this.foundations[foundationIndex].length !== 0;
    let cardTypeIdentical: boolean;

    if (foundationIsNotEmpty) {
      cardTypeIdentical =
        this.foundations[foundationIndex][0].type === card.type;
    } else {
      cardTypeIdentical = true;
    }

    if (increasing && cardTypeIdentical) {
      if (!isNaN(tableauColumnIndex)) {
        this.removeTopCardFromTableauColumn(tableauColumnIndex);
      } else {
        this.removeTopCardFromTalon();
      }

      this.foundations[foundationIndex].push(card);
    }
  }

  validateTableau(tableauColumnIndex: number, card: Card) {
    const lastCardInTheTableauColumn =
      this.tableau[tableauColumnIndex][
        this.tableau[tableauColumnIndex].length - 1
      ];
    const decreasing = lastCardInTheTableauColumn.value - 1 === card.value;
    const mismatchColor = lastCardInTheTableauColumn.color !== card.color;

    if (decreasing && mismatchColor) {
      this.removeTopCardFromTalon();
      this.tableau[tableauColumnIndex].push(card);
    }
  }
}
