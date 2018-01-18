$(function() {
  dataRef.on("value", function(snapshot) {
    if (bidding.data.content === null) {
      //IF THIS IS FIRST RUN, BIND AFTER GETTING DATA
      bidding.data.content = snapshot.val();
      bindData();
    } else bidding.data.content = snapshot.val();

    bidding.parseGroup();
    bidding.parseInterested();
  });

  bidding.resetBids(1);
});

const dataRef = appdb.ref();

var bidding = {
  data: {
    content: null,
    controlText: "> Hide"
  },

  parseGroup: function() {
    var lotlist = bidRef.content.alllots;
    var currentGroup = bidRef.content.group.currentGroup;
    var groupLots = [];
    var groupMax = null;
    var maxLot = null;
    var j = 0;

    for (var i = 0; i < lotlist.length; i++) {
      if (lotlist[i].group === currentGroup) {
        j++;
        groupLots.push(lotlist[i]);
        if (lotlist[i].maxBid > groupMax) {
          groupMax = lotlist[i].maxBid;
          maxLot = j;
        }
      }
    }

    if (groupMax > 0) {
      bidRef.content.group.maxbid = groupMax;
      bidding.addInterestedBidder(77777);
      if (bidRef.content.proposal.type === "waiting")
        bidding.updateProposal(
          bidRef.content.current.ask,
          "BC, CAN",
          77777,
          groupLots[maxLot].lot,
          "openingoffer"
        );
    }
    bidRef.content.group.lots = groupLots;
  },

  parseInterested: function() {
    // var interested = bidRef.content.interested;
    // var newInterest = [];
    // for( i in interested){
    // 	newInterest.push({ bidder : i });
    // }
    // bidRef.content.interested = newInterest;
  },

  addInterestedBidder: function(bidder) {
    dataRef.child("/interested/" + bidder).set(true);
  },

  clearInterested: function() {
    dataRef.child("/interested/").remove();
  },

  updateProposal: function(bid, loc, bidder, lot, type) {
    var proposal = {
      bid: bid,
      location: loc,
      bidder: "77777",
      lot: lot,
      type: type
    };

    dataRef.child("/proposal").set(proposal);
  },

  placeBid: function(amt, loc, lot, bidder) {
    var increment = 2500;

    var current = {
      bid: amt,
      ask: amt + increment,
      bidder: bidder,
      location: loc,
      lot: lot,
      status: "bidding"
    };

    dataRef.child("/current").set(current);
  },

  resetBids: function(group) {
    dataRef.child("/group/").set({
      currentGroup: group,
      maxbid: null
    });
    bidding.placeBid(0, "", "", "");
    dataRef.child("/current/status").set("waiting");
    bidding.updateProposal(null, null, null, null, "waiting");
    bidding.clearInterested();
  },

  sellLot: function() {
    bidding.updateProposal(null, null, null, null, "waiting");
    bidding.clearInterested();
    dataRef.child("/current/status").set("sold");
  },

  controller: {
    hideControls: function() {
      $(".js--proto-controls").toggleClass("s-hidden");
      if ($(".js--proto-controls").hasClass("s-hidden"))
        bidding.data.controlText = "< Show";
      else bidding.data.controlText = "> Hide";
    },

    nextGroup: function() {
      bidding.resetBids(bidRef.content.group.currentGroup + 1);
    },

    prevGroup: function() {
      if (bidRef.content.group.currentGroup > 1)
        bidding.resetBids(bidRef.content.group.currentGroup - 1);
    },
    reset: function() {
      bidding.resetBids(1);
    },

    sellLot: function() {
      bidding.sellLot();
    },

    showInterest: function() {
      bidding.addInterestedBidder(
        Math.floor(Math.random() * (15000 - 10000)) + 10000
      );
    },

    clearInterest: function() {
      bidding.clearInterested();
    },

    onsiteBid: function() {
      bidding.placeBid(bidRef.content.current.ask, "On Site", null, "On Site");
      bidding.updateProposal(null, null, null, null, "siteon");
    },

    proposeMaxBid: function() {
      bidding.updateProposal(
        bidRef.content.current.ask,
        "BC, CAN",
        77777,
        bidRef.content.group.lots[0].lot,
        "maxbid"
      );
    },

    proposeBid: function() {
      bidding.updateProposal(
        bidRef.content.current.ask,
        "BC, CAN",
        77777,
        bidRef.content.group.lots[0].lot,
        "internetbid"
      );
    },

    acceptProposal: function() {
      var bidType;
      if (bidRef.content.proposal.type === "internetbid")
        bidType = "interneton";
      else bidType = "maxon";

      bidding.placeBid(
        bidRef.content.current.ask,
        bidRef.content.proposal.location,
        bidRef.content.proposal.lot,
        bidRef.content.proposal.bidder
      );
      bidding.updateProposal(null, null, null, null, bidType);
    },

    rejectProposal: function() {
      bidding.updateProposal(null, null, null, null, "waiting");
    },

    seedData: function() {
      $.ajax({
        method: "GET",
        url: "assets/js/lotdata.json",
        dataType: "json",
        success: function(data) {
          dataRef.set(data);
        },
        error: function(jqXHR, textStatus) {
          console.log(jqXHR.responseText);
          console.log("Request failed: " + textStatus);
        }
      });
    }
  }
};

var bidRef = bidding.data;

function bindData() {
  rivets.bind($(".js--data-container"), {
    bids: bidding.data,
    controller: bidding.controller
  });
}
