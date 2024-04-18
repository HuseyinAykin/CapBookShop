using my.bookshop as my from '../db/data-model';

service CatalogService {
    entity Books         as projection on my.Books;
    entity Authors       as projection on my.Authors;
    entity Categories    as projection on my.Categories;
    entity SubCategories as projection on my.SubCategories;
    entity Reportings    as projection on my.Reportings;

    @Aggregation.ApplySupported.PropertyRestrictions: true
    view BooksCharts as
        select from my.Reportings {
            @Analytics.Dimension: true
            bookName,
            @Analytics.Dimension: true
            borrowedDate,
            @Analytics.Dimension: true
            year,
            @Analytics.Measure  : true
            @Aggregation.default: #SUM
            count
        }

    @Aggregation.ApplySupported.PropertyRestrictions: true
    view AuthorsCharts as
        select from my.Reportings {
            @Analytics.Dimension: true
            authorName,
            @Analytics.Dimension: true
            borrowedDate,
            @Analytics.Dimension: true
            year,
            @Analytics.Measure  : true
            @Aggregation.default: #SUM
            count
        }
}

annotate CatalogService with @(requires: 'admin');
