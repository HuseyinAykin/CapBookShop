using {
    managed,
    cuid,
    Country

} from '@sap/cds/common';

namespace my.bookshop;

entity Books : managed {
    key ID           : Integer               @title: 'Book ID';
        title        : localized String(111) @title: 'Title';
        stock        : Integer               @title: 'Stock';
        price        : Decimal(9, 2)         @title: 'Price';
        page         : Integer               @title: 'Page';
        lang         : String                @title: 'Language';
        isbn         : String                @title: 'Barcode No';
        availability : String(1)             @title: 'Availability';
        criticality  : Integer;
        // currency : Currency;
        author       : Association to one Authors;
        category     : Association to one Categories;
}

entity Authors : managed,cuid {
    // key ID             : Integer @title: 'Author ID';
        name           : String  @title: 'Author Name';
        countryOfBirth : Country;
        books          : Association to many Books
                             on books.author = $self;
}

entity Categories: cuid{
    // key ID          : Integer @title: 'Category ID';
        name        : String  @title: 'Category Name';
        subCategory : Composition of many SubCategories
                          on subCategory.category = $self;
        books       : Association to many Books
                          on books.category = $self;

}

entity SubCategories {
    key ID       : Integer @title: 'Sub Category ID';
        name     : String  @title: 'Sub Category Name';
        category : Association to one Categories;
}

entity Reportings : cuid {
    borrowedDate  : Date;
    person     : String;
    returnDate : Date;
    book_ID    : Integer @title        : 'Book ID';
    bookName   : String;
    authorName : String;
    year       : String;
    count : Integer default 1;
// book         : Composition of one Books;
// author       : Composition of one Authors;
}
