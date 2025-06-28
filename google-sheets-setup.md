# 📊 Google Sheets Integration Setup

## Step 1: Create Google Sheet
1. Go to [sheets.google.com](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Love Calculator Data"
4. Add these headers in row 1:
   - A1: `Name 1`
   - B1: `Name 2` 
   - C1: `Percentage`
   - D1: `Timestamp`
   - E1: `User Agent`

## Step 2: Set up Google Apps Script
1. In your Google Sheet, go to **Extensions** → **Apps Script**
2. Replace the default code with this:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = e.parameter;
    
    const rowData = [
      data.name1,
      data.name2, 
      data.percentage,
      data.timestamp,
      data.userAgent
    ];
    
    sheet.appendRow(rowData);
    
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ 'result': 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Click **Save** and give it a name like "Love Calculator API"
4. Click **Deploy** → **New deployment**
5. Choose **Web app**
6. Set:
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Click **Deploy**
8. Copy the **Web app URL** (you'll need this)

## Step 3: Update Your Website
Replace the `GOOGLE_SHEET_URL` in your `script.js` with the URL you got from step 2.

## Step 4: Test
1. Deploy your website
2. Test with different devices
3. Check your Google Sheet - you should see data appearing!

---

**Alternative: Simple PHP Backend**

If you prefer a traditional server solution, I can create a simple PHP script that saves to a text file or database. 