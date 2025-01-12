import BigNumber from 'bignumber.js';

const address = 'ak_2fxchiLvnj9VADMAXHBiKPsaCEsTFehAspcmWJ3ZzF3pFK1hB5';
const amount = 0.1;

describe('Test cases for Withdraw Page', () => {
  it('Opens Withdraw page, uses scan button, validates entered amount, reviews and sends ', () => {
    cy.login()
      .openWithdraw()

      .get('[data-cy=scan-button]')
      .click()
      .get('.qr-code-reader video')
      .should('be.visible')
      .get('.modal.qr-code-reader [data-cy=btn-close]')
      .click()

      .enterInputAmount(amount)
      .get('[data-cy=amount]')
      .should('not.have.class', 'error')
      .enterAddress('asd')
      .inputShouldHaveError('[data-cy=address]')
      .enterAddress(0)
      .inputShouldHaveError('[data-cy=address]')
      .enterAddress('test.chain')
      .should('not.have.class', 'error')
      .enterAddress('ak_wMHNCzQJ4HUL3TZ1fi6nQsHg6TjmHLs1bPXSp8iQ1VmxGNAZ4')
      .get('[data-cy=address]')
      .should('not.have.class', 'error')

      .get('[data-cy=next-step-button]')
      .should('not.have.class', 'disabled')
      .click()
      .get('[data-cy=next-step-button]')
      .should('be.visible')

      // check on step2 if everything is OK
      .get('[data-cy=review-sender] > .value')
      .should('contain', address)
      .get('[data-cy=review-recipient] > .value')
      .should('contain', 'ak_wMHNCzQJ4HUL3TZ1fi6nQsHg6TjmHLs1bPXSp8iQ1VmxGNAZ4')
      .get('[data-cy=review-total]')
      .invoke('text')
      .then((total) => {
        const getNum = (s) => +/[+-]?([0-9]*[.])?[0-9]+/.exec(s)[0];
        const n1 = getNum(total);
        cy.get('[data-cy=review-fee]').invoke('text').then((fee) => {
          const n2 = getNum(fee);
          cy.expect(BigNumber(n1).minus(n2).toNumber()).to.eq(amount);
        });
      })

      // edit, sending to your own account
      .get('[data-cy=edit]')
      .click()
      .enterAddress(address)
      .get('[data-cy=address]')
      .should('have.class', 'warning')
      .get('[data-cy=next-step-button]')
      .should('not.have.class', 'disabled')
      .click()
      .get('[data-cy=review-recipient] > .value')
      .should('contain', address)

      // send
      .get('[data-cy=edit] + [data-cy=next-step-button]')
      .should('be.visible')
      .click()
      .get('[data-cy=spend-success]', { timeout: 10000 })
      .should('be.visible')
      .get('[data-cy=btn-close]')
      .click()
      .openTransactions()
      .get('[data-cy=pending-txs]')
      .should('be.visible');
  });
});
