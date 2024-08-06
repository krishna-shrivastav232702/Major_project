const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");


const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: String,
    filename: String,
  },
  price: {
    type: Number,
    min: [0, 'Price must be positive'],
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
  },
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: "Review",
  },],
  owner:{
    type:Schema.Types.ObjectId,
    ref:"User",
  },

}, { timestamps: true });

listingSchema.post("findOneAndDelete", async (listing) => {
  if(listing){
    await Review.deleteMany({_id:{$in:listing.reviews}});
  } 
});


const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
