using CatalogService as service from '../../../srv/cat-service';


//-------------------- Labels --------------------------//
annotate service.Authors with {
    ID @Common.Label: '{i18n>authorID}';

};

annotate service.Countries with {
    name @Common.Label: '{i18n>countryName}';

};

annotate service.Books with {

    ID       @Common.Label: '{i18n>bookID}';
    author   @Common.Label: '{i18n>author}';
    category @Common.Label: '{i18n>category}';

};

annotate service.Reportings with {
    bookName     @Common.Label: '{i18n>bookName}';
    authorName   @Common.Label: '{i18n>authorName}';
    borrowedDate @Common.Label: '{i18n>borrowedDate}';
    returnDate   @Common.Label: '{i18n>returnDate}';
    person       @Common.Label: '{i18n>person}'
}

//------------------------------ Selection Fields & Line Items -----------------------//
annotate service.Books @(UI: {
    PresentationVariant: {
        $Type         : 'UI.PresentationVariantType',
        RequestAtLeast: [isbn]

    },

    SelectionFields    : [
        ID,
        title,
        author_ID,
        category_ID,
        isbn
    ],

    LineItem           : [
        {
            $Type: 'UI.DataField',
            Value: ID
        },

        {
            $Type: 'UI.DataField',
            Value: title
        },
        {
            $Type: 'UI.DataField',
            Value: author.name
        },
        {
            $Type: 'UI.DataField',
            Value: category.name
        },
        {
            Value      : availability,
            Criticality: criticality
        }
    ]
});

annotate service.Authors @(UI: {
    SelectionFields: [name],

    LineItem       : [
        {
            $Type: 'UI.DataField',
            Value: name
        },
        {
            $Type: 'UI.DataField',
            Value: countryOfBirth.name
        }

    ],
});

annotate service.Categories @(UI: {
    SelectionFields: [name],

    LineItem       : [
        {
            $Type: 'UI.DataField',
            Value: name
        }

    ],
});

annotate service.Reportings @(UI: {
    SelectionFields: [
        borrowedDate,
        returnDate
    ],


    LineItem       : [

        {
            $Type: 'UI.DataField',
            Value: bookName
        },
           {
            $Type: 'UI.DataField',
            Value: authorName
        },
        {
            $Type: 'UI.DataField',
            Value: borrowedDate
        },
        {
            $Type: 'UI.DataField',
            Value: returnDate
        },
        {
            $Type: 'UI.DataField',
            Value: person
        }
    ]
});

//------------------- Charts -----------------------
annotate service.BooksCharts @(UI: {
    SelectionFields: [borrowedDate],
    Chart          : {
        ChartType          : #Column,
        Dimensions         : [bookName

        ],
        DimensionAttributes: [{
            Dimension: 'bookName',
            Role     : #Category
        }],
        Measures           : ['count'],
        MeasureAttributes  : [{
            Measure: 'count',
            Role   : #Axis1
        }]
    }


});

annotate service.AuthorsCharts @(UI: {
    SelectionFields: [borrowedDate],
    Chart          : {
        ChartType          : #Bar,
        Dimensions         : [authorName],
        DimensionAttributes: [{
            Dimension: 'authorName',
            Role     : #Category
        }],
        Measures           : ['count'],
        MeasureAttributes  : [{
            Measure: 'count',
            Role   : #Axis1
        }]
    }


});


// ------------------- Required Properties
// annotate service.Books with @(
//     Capabilities:{
//         FilterRestrictions : {
//             $Type : 'Capabilities.FilterRestrictionsType',
//             RequiredProperties : [
//                 isbn
//             ]
//         }
//     }
// );


//--------------------Value List---------------
annotate service.Books with {
    ID
          @Common.ValueListWithFixedValues: false
          @Common.ValueList               : {
        @Type         : 'Common.ValueListType',
        CollectionPath: 'Books',
        SearchSupported,
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'ID',
                ValueListProperty: 'ID'
            },

            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'title'
            }
        ]
    };

    title @Common.ValueList               : {
        @Type         : 'Common.ValueListType',
        CollectionPath: 'Books',
        SearchSupported,
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'title',
            ValueListProperty: 'title'
        }]
    };
    author

          @Common.ValueList               : {
        @Type          : 'Common.ValueListType',
        CollectionPath : 'Authors',
        SearchSupported: true,
        Parameters     : [
            {
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'author_ID',
                ValueListProperty: 'ID'
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'name'
            }
        ]
    };
    category

          @Common.ValueList               : {
        @Type          : 'Common.ValueListType',
        CollectionPath : 'Categories',
        SearchSupported: true,
        Parameters     : [
            {
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'category_ID',
                ValueListProperty: 'ID'
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'name'
            }
        ]
    }
}
