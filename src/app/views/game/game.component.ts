import { Component, OnInit } from '@angular/core';
import { CardsService } from 'src/app/services/cards.service';
import { Card, CardValue } from 'src/app/model/card';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
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

  classForCardsTopOfEachOther(isFirst: boolean, card: Card, cards: Card[], cardIndex: number) {
    if (!isFirst && !card.visible) {
      return 'cards-on-top-of-each-other';
    }

    if (!isFirst && card.visible && !cards[cardIndex - 1].visible) {
      return "cards-on-top-of-each-other";
    }

    if (!isFirst && card.visible && cards[cardIndex - 1].visible) {
      return "cards-on-top-of-each-other--space-large";
    }
  }

  flipACardFromAStock() {
    const flippedCard = this.stock.pop();
    flippedCard.visible = true;
    this.talon.push(flippedCard);
  }

  onTalonCardDragged(event, card: Card) {
    event.dataTransfer.setData('draggedCards', JSON.stringify([card]));
  }

  onTableauCardDragged(event, card: Card, cardIndex: number, tableauColumnIndexOfDraggedCard: number) {
    const singleCardDragged = this.tableau[tableauColumnIndexOfDraggedCard].length === cardIndex + 1;
    if (singleCardDragged) {
      event.dataTransfer.setData('draggedCards', JSON.stringify([card]));
    } else {
      // Multiple card dragged
      const draggedCards = this.tableau[tableauColumnIndexOfDraggedCard].filter((card, index) => index >= cardIndex);
      event.dataTransfer.setData('draggedCards', JSON.stringify(draggedCards));
    }

    event.dataTransfer.setData('tableauColumnIndexOfDraggedCard', tableauColumnIndexOfDraggedCard);
  }

  dropToFoundation(event) {
    event.preventDefault();

    const cards: Card[] = JSON.parse(event.dataTransfer.getData('draggedCards')); // TODO: itt nem engedhetjük, hogy több kártya érkezzen meg ide
    const fromTableauColumnIndex: number | undefined = parseInt(event.dataTransfer.getData('tableauColumnIndexOfDraggedCard'));
    const toFoundationIndex: number = parseInt(event.target.id);

    if (cards.length > 1) {
      throw new Error('Cards can only be placed one at a time! ' + cards);
    }

    this.validateFoundation(cards[0], toFoundationIndex, fromTableauColumnIndex);
  }

  dropToTableauColumn(event, toTableauColumnIndex: number) {
    event.preventDefault();

    const cards: Card[] = JSON.parse(event.dataTransfer.getData('draggedCards'));
    const fromTableauColumnIndex: number | undefined = parseInt(event.dataTransfer.getData('tableauColumnIndexOfDraggedCard'));

    this.validateTableau(cards, toTableauColumnIndex, fromTableauColumnIndex);
  }

  allowDrop(event) {
    event.preventDefault();
  }

  setLastTableauColumnCardToVisible(card: Card, isLast: boolean) {
    if (isLast) {
      card.visible = true;
    }
  }

  reuseTalon() {
    this.stock = this.talon;
    this.stock.reverse();
    this.stock.forEach(card => card.visible = false);
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

  private validateTableau(cards: Card[], toTableauColumnIndex: number, fromTableauColumnIndex: number | undefined) {
    const lastCardInTheTableauColumn = this.tableau[toTableauColumnIndex][this.tableau[toTableauColumnIndex].length - 1];

    if (lastCardInTheTableauColumn === undefined && cards[0].value === CardValue.KING) {
      this.tableau[toTableauColumnIndex].push(...cards);
      this.cleanupAfterCardIsPlaced(fromTableauColumnIndex, cards.length);
      return;
    }

    const decreasing = lastCardInTheTableauColumn.value - 1 === cards[0].value;
    const mismatchColor = lastCardInTheTableauColumn.color !== cards[0].color;

    if (decreasing && mismatchColor) {
      this.tableau[toTableauColumnIndex].push(...cards);
      this.cleanupAfterCardIsPlaced(fromTableauColumnIndex, cards.length);
    }
  }

  private cleanupAfterCardIsPlaced(fromTableauColumnIndex: number | undefined, numberOfCardsToRemove?: number) {
    if (!isNaN(fromTableauColumnIndex)) { // If the card is lifted from a tableau column     
      if (numberOfCardsToRemove === undefined) {
        this.tableau[fromTableauColumnIndex].pop();
      } else {
        for (let i = 0; i < numberOfCardsToRemove; i++) {
          this.tableau[fromTableauColumnIndex].pop();
        }
      }
    } else { // If the card is lifted from a talon
      // Remove top card from talon
      this.talon.pop();
    }
  }


}
