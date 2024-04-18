const cds = require("@sap/cds");

module.exports = cds.service.impl(async function () {
    await cds.connect.to('db');
    // const { Books, Reportings } = cds.entities;

    this.after('READ', 'Books', Books => {
        const books = Array.isArray(Books) ? Books : [Books];

        books.forEach((book) => {
            if (book.availability === "A") {
                book.criticality = 3;
            } else {
                book.criticality = 1;
            }
        });
    });


    this.before("CREATE", 'Books', (req) => {
        req.data.availability = "A";
    });

    this.after("CREATE", 'Reportings', async (req) => {
        const db = await cds.connect.to('db');
        const Books = db.entities.Books;
        try {
            await UPDATE(Books).set({
                availability: 'N'
            }).where({ ID: req.book_ID })

            try {
                await SELECT.from(Books).where({ ID: req.book_ID });
            } catch (oError) {
                console.log(oError);
            }


        } catch (error) {
            console.log("error");
        }

    });

}
)