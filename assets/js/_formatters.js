rivets.formatters.price = function(value) {
  return formatprice(value);
};

function formatprice(amt) {
  if (amt === 0) return 0;
  else if (!amt) return null;

  var price;

  if ($("#js--body").hasClass("INR"))
    price = amt
      .toString()
      .replace(/(\d)(?=(\d\d)+\d$)/g, '$1<span class="divider"></span>');
  else
    price = amt
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, '<span class="divider"></span>');

  return price;
}

rivets.formatters.compare = function(value, comparisons) {
  if (typeof value == "undefined" || typeof comparisons == "undefined")
    return false;

  var args = comparisons.split(",");
  if (args.includes(value)) return true;
  return false;
};

rivets.binders.addtextclass = function(el, value) {
  if (value === "") return false;
  $(el)
    .removeClass()
    .addClass("s-" + value);
};

rivets.formatters.lengthToBool = function(value) {
  if (typeof value == "undefined") return false;
  if (value.length === 0) return false;
  return true;
};

rivets.formatters.invert = function(value) {
  if (typeof value != "undefined") return false;
  return true;
};

rivets.formatters.propertyList = function(obj) {
  return (function() {
    var properties = [];
    for (key in obj) {
      properties.push({ key: key, value: obj[key] });
    }
    return properties;
  })();
};

rivets.formatters.internetOrOnsiteString = function(location) {
  if (typeof location != "undefined" && location != "On Site")
    return "Internet";
  return "Onsite";
};
