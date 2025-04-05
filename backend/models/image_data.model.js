const mongoose = require("mongoose");

const ImageDataSchema = mongoose.Schema(
    {
        base64_image: {
            type: String,
            required: [true, "Base64 data missing."]
        }
    },
    { timestamps: true }
)

const ImageData = mongoose.model("Image Data", ImageDataSchema);

module.exports = ImageData;