// const fs=require('fs');
// const path=require('path');
// const reports=require('../models/report');


// async function handleUploading(req, res) {
//     const { image, filename, childName, sessionId } = req.body;

//     // Ensure all required fields are provided
//     if (!image || !filename || !childName || !sessionId) {
//         return res.status(400).json({ error: 'Missing required fields: image, filename, childName, or sessionId' });
//     }

//     // Define the absolute path for the photos directory (outside the controllers directory)
//     const imagesDirectory = path.join(__dirname, '..', 'photos');
//     if (!fs.existsSync(imagesDirectory)) {
//         fs.mkdirSync(imagesDirectory, { recursive: true });
//     }

//     const childDirectory = path.join(imagesDirectory, childName);
//     const sessionDirectory = path.join(childDirectory, sessionId);

//     // Create directories if they don’t exist
//     if (!fs.existsSync(childDirectory)) {
//         fs.mkdirSync(childDirectory, { recursive: true });
//     }
//     if (!fs.existsSync(sessionDirectory)) {
//         fs.mkdirSync(sessionDirectory, { recursive: true });
//     }

//     // Decode base64 image and save it
//     const base64Data = image.replace(/^data:image\/png;base64,/, "");
//     const filePath = path.join(sessionDirectory, filename);

//     try {
//         // Save the file
//         fs.writeFileSync(filePath, base64Data, 'base64');

//         // Add only the image path to the `images` array
//         const imagePath = path.join('photos', childName, sessionId, filename); // Relative path

//         // Check if the imgpath already exists
//         const existingReport = await reports.findOne({
//             childname: childName,
//             sessionid: sessionId,
//             "images.imgpath": imagePath, // Check if the imgpath already exists
//         });

//         if (existingReport) {
//             // If the image path already exists, skip adding it
//             return res.status(200).json({ success: false, message: 'Duplicate image path, not added again.' });
//         }

//         // Find the document by childName and sessionId, and update the images array
//         await reports.findOneAndUpdate(
//             { childname: childName, sessionid: sessionId }, // Find by childName and sessionId
//             { $push: { images: { imgpath: imagePath } } },  // Push the new image path to the images array
//             { new: true, upsert: true }                     // Create a new document if it doesn't exist
//         );

//         // Respond to the client only once
//         res.json({ success: true, message: 'Image saved and path updated successfully' });
//     } catch (error) {
//         console.error("Error saving image or updating database:", error);
//         res.status(500).json({ error: 'Error saving image or updating database' });
//     }
// }


// module.exports={
//     handleUploading
// }



// const fs = require('fs');
// const path = require('path');
// const reports = require('../models/report');

// async function handleUploading(req, res) {
//     const { image, filename, screenshot, screenshotFilename, childName, sessionId } = req.body;

//     if (!image || !filename || !screenshot || !screenshotFilename || !childName || !sessionId) {
//         return res.status(400).json({ error: 'Missing required fields' });
//     }

//     const imagesDirectory = path.join(__dirname, '..', 'photos');
//     const childDirectory = path.join(imagesDirectory, childName);
//     const sessionDirectory = path.join(childDirectory, sessionId);

//     if (!fs.existsSync(sessionDirectory)) {
//         fs.mkdirSync(sessionDirectory, { recursive: true });
//     }

//     // Decode and save image
//     const base64Image = image.replace(/^data:image\/png;base64,/, "");
//     const imagePath = path.join(sessionDirectory, filename);
//     fs.writeFileSync(imagePath, base64Image, 'base64');

//     // Decode and save screenshot
//     const base64Screenshot = screenshot.replace(/^data:image\/png;base64,/, "");
//     const screenshotPath = path.join(sessionDirectory, screenshotFilename);
//     fs.writeFileSync(screenshotPath, base64Screenshot, 'base64');

//     try {
//         const relativeImagePath = path.join('photos', childName, sessionId, filename);
//         const relativeScreenshotPath = path.join('photos', childName, sessionId, screenshotFilename);

//         // Check for duplicates
//         const existingReport = await reports.findOne({
//             childname: childName,
//             sessionid: sessionId,
//             "images.imgpath": relativeImagePath,
//         });

//         if (existingReport) {
//             return res.status(200).json({ success: false, message: 'Duplicate image path' });
//         }

//         // Update MongoDB with image and screenshot pair
//         await reports.findOneAndUpdate({ childname: childName, sessionid: sessionId }, { $push: { images: { imgpath: relativeImagePath, screenshotpath: relativeScreenshotPath } } }, { new: true, upsert: true });

//         res.json({ success: true, message: 'Files saved successfully' });
//     } catch (error) {
//         console.error("Error saving files:", error);
//         res.status(500).json({ error: 'Error saving files or updating database' });
//     }
// }

// module.exports = {
//     handleUploading
// }



const fs=require('fs');
const path=require('path');
const reports=require('../models/report');

async function handleUploading(req, res) {
    const { image, filename, screenshot, screenshotFilename, childName, sessionId } = req.body;

    if (!image || !filename || !screenshot || !screenshotFilename || !childName || !sessionId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const imagesDirectory = path.join(__dirname, '..', 'photos');
    const childDirectory = path.join(imagesDirectory, childName);
    const sessionDirectory = path.join(childDirectory, sessionId);

    if (!fs.existsSync(sessionDirectory)) {
        fs.mkdirSync(sessionDirectory, { recursive: true });
    }

    // Decode and save image
    const base64Image = image.replace(/^data:image\/png;base64,/, "");
    const imagePath = path.join(sessionDirectory, filename);
    fs.writeFileSync(imagePath, base64Image, 'base64');

    // Decode and save screenshot
    const base64Screenshot = screenshot.replace(/^data:image\/png;base64,/, "");
    const screenshotPath = path.join(sessionDirectory, screenshotFilename);
    fs.writeFileSync(screenshotPath, base64Screenshot, 'base64');

    try {
        const relativeImagePath = path.join('photos', childName, sessionId, filename);
        const relativeScreenshotPath = path.join('photos', childName, sessionId, screenshotFilename);

        // Check for duplicates
        const existingReport = await reports.findOne({
            childname: childName,
            "sessions.sessionId": sessionId,
            "sessions.images.imgpath": relativeImagePath,
        });

        if (existingReport) {
            return res.status(200).json({ success: false, message: 'Duplicate image path' });
        }

        // Update MongoDB with image and screenshot pair
        await reports.findOneAndUpdate(
            { childname: childName, "sessions.sessionId": sessionId },
            { $push: { "sessions.$.images": { imgpath: relativeImagePath, screenshotpath: relativeScreenshotPath } } },
            { new: true, upsert: true }
        );

        res.json({ success: true, message: 'Files saved successfully' });
    } catch (error) {
        console.error("Error saving files:", error);
        res.status(500).json({ error: 'Error saving files or updating database' });
    }
}

module.exports={
        handleUploading
    }