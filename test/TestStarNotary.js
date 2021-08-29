const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', 'BAR', tokenId, {from: accounts[0]});
    assert.equal(await instance.lookUptokenIdToStarInfo.call(tokenId), 'Awesome Star!');
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', 'BAR', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', 'BAR', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', 'BAR', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', 'BAR', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    // 1. create a Star with different tokenId
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    let instance = await StarNotary.deployed();
    let tokenId = 6;    
    await instance.createStar('foo', 'BAR', tokenId, {from: accounts[0]});
    let result = await instance.tokenIdToStarInfo.call(tokenId);
    assert.equal(result.name, 'foo');
    assert.equal(result.symbol, 'BAR');
});

describe('lets 2 users exchange stars', () => {
    it('sender is the owner of at least one of the tokens', async() => {
        // 1. create 2 Stars with different tokenId
        // 2. Call the exchangeStars functions implemented in the Smart Contract
        // 3. Verify that the owners changed
        let instance = await StarNotary.deployed();
        let user1 = accounts[1];
        let user2 = accounts[2];
        let star1Id = 7;    
        let star2Id = 8;
    
        await instance.createStar('foo', 'BAR', star1Id, {from: user1});
        await instance.createStar('foz', 'BAZ', star2Id, {from: user2});
        assert.equal(await instance.ownerOf.call(star1Id), user1);
        assert.equal(await instance.ownerOf.call(star2Id), user2);
    
        await instance.exchangeStars(star1Id, star2Id, {from: user1});
        assert.equal(await instance.ownerOf.call(star1Id), user2);
        assert.equal(await instance.ownerOf.call(star2Id), user1);
    });

    it('sender not the owner of the tokens', async() => {
        // 1. create 2 Stars with different tokenId
        // 2. Call the exchangeStars functions implemented in the Smart Contract
        // 3. Verify that the owners changed
        let instance = await StarNotary.deployed();
        let user1 = accounts[1];
        let user2 = accounts[2];
        let star1Id = 9;    
        let star2Id = 10;
    
        await instance.createStar('foo', 'BAR', star1Id, {from: user1});
        await instance.createStar('foz', 'BAZ', star2Id, {from: user2});
        assert.equal(await instance.ownerOf.call(star1Id), user1);
        assert.equal(await instance.ownerOf.call(star2Id), user2);
    
        try {
            await instance.exchangeStars(star1Id, star2Id, {from: accounts[0]});                        
        } catch (error) {
            assert.equal(error.reason, 'You have to own at least one of the tokens');
        }
    });
});


it('lets a user transfer a star', async() => {
    // 1. create a Star with different tokenId
    // 2. use the transferStar function implemented in the Smart Contract
    // 3. Verify the star owner changed.
});

it('lookUptokenIdToStarInfo test', async() => {
    // 1. create a Star with different tokenId
    // 2. Call your method lookUptokenIdToStarInfo
    // 3. Verify if you Star name is the same
    let instance = await StarNotary.deployed();
    let tokenId = 999;    
    await instance.createStar('foo', 'BAR', tokenId, {from: accounts[0]});
    assert.equal(await instance.lookUptokenIdToStarInfo(tokenId), 'foo');
});