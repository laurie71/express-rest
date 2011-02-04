// COPYRIGHT

// Dummy data for the blog example

var lorem = '<p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec libero. Suspendisse bibendum. Cras id urna. Morbi tincidunt, orci ac convallis aliquam, lectus turpis varius lorem, eu posuere nunc justo tempus leo. Donec mattis, purus nec placerat bibendum, dui pede condimentum odio, ac blandit ante orci ut diam. Cras fringilla magna. Phasellus suscipit, leo a pharetra condimentum, lorem tellus eleifend magna, eget fringilla velit magna id neque. Curabitur vel urna. In tristique orci porttitor ipsum. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec libero. Suspendisse bibendum. Cras id urna. Morbi tincidunt, orci ac convallis aliquam, lectus turpis varius lorem, eu posuere nunc justo tempus leo.</p>';
var ipsum = '';

module.exports = [
    { title: 'Entry 3', posted: 'May 27, 2015', author: 'Laurie',
        tags: ['orci', 'lectus', 'varius', 'turpis'],
        categories: ['templates', 'internet'],
        body: lorem
    },

    { title: 'Entry 2', posted: '2011-02-04T09:43:19Z', author: 'Laurie', tags: [], categories: [], body: ipsum },
    { title: 'Entry 1', posted: '2011-02-03T12:03:22Z', author: 'Laurie', tags: [], categories: [], body: lorem }
];

module.exports[0].comments = [
    { id: 3, posted: 'April 21st, 2009 at 4:32 pm', author: 'John',  body: '<p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec libero. Suspendisse bibendum.</p>' },
    { id: 2, posted: 'April 20th, 2009 at 3:21 pm', author: 'Wiley', body: '<p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec libero. Suspendisse bibendum. Cras id urna. Morbi tincidunt, orci ac convallis aliquam, lectus turpis varius lorem, eu posuere nunc justo tempus leo.</p>' },
    { id: 1, posted: 'April 20th, 2009 at 2:17 pm', author: 'Alice', body: '<p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec libero. Suspendisse bibendum.</p>' }
];
