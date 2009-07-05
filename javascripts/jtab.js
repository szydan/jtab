/**
 * JTab - Javascript/CSS Guitar Chord and Tab Notation for the Web.
 * Version 1.0
 * Written by Paul Gallagher (http://tardate.com), 2009.
 * See:
 *   http://tardate.com/jtab : more information on availability, configuration and use.
 *   http://github.com/tardate/jtab/tree/master : source code repository, wiki, documentation
 *
 * This library also depends on the following two libraries that must be loaded for it to work:
 *   prototype - http://www.prototypejs.org/
 *   Rapha�l - http://raphaeljs.com/
 *
 *
 * This library is free software; you can redistribute it and/or modify it under the terms of the GNU Lesser General 
 * Public License as published by the Free Software Foundation; either version 2.1 of the License, or (at your option) 
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied 
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more 
 * details.
 *
 * You should have received a copy of the GNU Lesser General Public License along with this library; if not, write to 
 * the Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA 
 */


//
// define extensions to the Raphael class
//
  
Raphael.fn.scale = 1; 
Raphael.fn.tabtype = 0;  // 0 = none, 1 = tab & chord, 2 = chord, 3 = tab
Raphael.fn.has_chord = false;
Raphael.fn.has_tab = false;
Raphael.fn.margin_top = 36;
Raphael.fn.margin_bottom = 10;
Raphael.fn.margin_left = 16;
Raphael.fn.margin_right = 10;

Raphael.fn.current_offset = Raphael.fn.margin_left;

Raphael.fn.string_spacing = 16;
Raphael.fn.strings_drawn = 6;
Raphael.fn.fret_spacing = 16;
Raphael.fn.frets_drawn = 4;
Raphael.fn.note_radius = 7;

Raphael.fn.fret_width = Raphael.fn.string_spacing * ( Raphael.fn.strings_drawn - 1 ); 
Raphael.fn.fret_height = Raphael.fn.fret_spacing * (Raphael.fn.frets_drawn + 0.5); 
Raphael.fn.chord_width = Raphael.fn.margin_left + Raphael.fn.fret_width + Raphael.fn.string_spacing + Raphael.fn.margin_right; 
Raphael.fn.chord_height = Raphael.fn.margin_top + Raphael.fn.fret_height + Raphael.fn.margin_bottom;

Raphael.fn.tab_current_string = 0; // 1,2,3,4,5,6 or 0 = not set
Raphael.fn.tab_margin_top = 10;
Raphael.fn.tab_top = Raphael.fn.chord_height + Raphael.fn.tab_margin_top;
Raphael.fn.tab_spacing = Raphael.fn.fret_spacing;
Raphael.fn.tab_height = Raphael.fn.tab_spacing * 5;
Raphael.fn.tab_char_width = 8;

Raphael.fn.total_height = Raphael.fn.tab_top + Raphael.fn.tab_height + Raphael.fn.margin_bottom;

Raphael.fn.color = "#000";
Raphael.fn.note_text_color = "#fff";
Raphael.fn.tab_text_color = "#000";


// step the current position for drawing
Raphael.fn.increment_offset = function (width) {
  w = ( width === undefined ) ? this.chord_width : width;
  this.current_offset += w;
  this.setSize( this.current_offset, this.total_height );
}


// draw the fretboard
Raphael.fn.chord_fretboard = function ( position, chord_name ) {
  var fret_left = this.current_offset + this.margin_left;

  this.text( // chord name
    fret_left + 2.5 * this.string_spacing,
    this.margin_top - 20, 
    chord_name).attr({stroke: this.color, "font-size":"20px"});
  
  if ( position == 1 ) { // nut
    this.path({stroke: this.color, "stroke-width":3 }).relatively().moveTo(
      fret_left, this.margin_top).lineTo(this.string_spacing * (this.strings_drawn - 1), 0);
  } else {
    this.path({stroke: this.color, "stroke-width":1 }).relatively().moveTo(
      fret_left, this.margin_top).lineTo(this.string_spacing * (this.strings_drawn - 1), 0);
  }
  for (var i = 1; i <= this.frets_drawn; i++ ) { // frets
    this.path({stroke: this.color}).relatively().moveTo(
      fret_left, 
      this.margin_top + (i * this.fret_spacing) ).lineTo(this.string_spacing * (this.strings_drawn - 1), 0 );
    switch ( position - 1 + i ) {
    case 3:
      pos="III";
      break;
    case 5:
      pos="V";
      break;
    case 7:
      pos="VII";
      break;
    default:
      pos="";
    }
    if ( pos.length > 0 ) { // draw fret position
      this.text(
        fret_left + this.fret_width + this.string_spacing * 0.5, 
        this.margin_top + ( ( i - 0.5 ) * this.fret_spacing), 
        pos).attr({stroke: this.color, "font-size":"12px"});
    }
  }
  for (var i = 0; i < this.strings_drawn; i++ ) { // strings
    this.path({stroke: this.color}).relatively().moveTo(
      fret_left + (i * this.string_spacing), 
      this.margin_top).lineTo(0, this.fret_spacing * (this.frets_drawn + 0.5) );
  }
  this.tab_extend(this.chord_width); // extend the tab if present
}

// draw a stroke (/)
Raphael.fn.stroke = function () {

  if (this.has_tab) {
    var width = this.tab_char_width * 3;
    // extend tab
    this.tab_extend(width);
    //  stroke
    this.path({stroke: this.color, "stroke-width":4 }).relatively().moveTo( 
        this.current_offset + this.tab_char_width, 
        this.tab_top  + (3.5 * this.tab_spacing) ).lineTo(
        this.tab_char_width, 
        - 2 * this.tab_spacing );

    this.increment_offset(width);    
  } else if (this.has_chord) {
    var fret_left = this.current_offset + this.margin_left;
    var dx = this.string_spacing;
    var dy = 2 * this.fret_spacing;     
    this.path({stroke: this.color, "stroke-width":4 }).relatively().moveTo( 
        fret_left + this.string_spacing, 
        this.margin_top + this.fret_spacing + dy ).lineTo(
        dx, 
        - dy );
    
    this.increment_offset(  this.margin_left + dx + this.margin_right ); 
  }
}

// draw a bar
Raphael.fn.bar = function () {

  if (this.has_tab) {
    var width = this.tab_char_width * 2;
    // extend tab
    this.tab_extend(width);
    this.path({stroke: this.color, "stroke-width":1 }).relatively().moveTo( //  bar
      this.current_offset + this.tab_char_width, this.tab_top ).lineTo( 0, this.tab_height );
    this.increment_offset(width);    

  } else if (this.has_chord) { 
    var fret_left = this.current_offset + this.margin_left;
    this.path({stroke: this.color, "stroke-width":1 }).relatively().moveTo( 
        fret_left + this.string_spacing, this.margin_top  ).lineTo(
        0, this.fret_height );
    
    this.increment_offset( this.string_spacing + this.margin_left + this.margin_right );  
  }
}

// draw double bar
Raphael.fn.doublebar = function () {
  if (this.has_tab) {
    var width = this.tab_char_width + 8;
    // extend tab
    this.tab_extend(width);
    //  bar
    this.path({stroke: this.color, "stroke-width":1 }).relatively().moveTo(
      this.current_offset + this.tab_char_width, this.tab_top ).lineTo( 
      0, this.tab_height );
    this.path({stroke: this.color, "stroke-width":4 }).relatively().moveTo(
      this.current_offset + this.tab_char_width + 6, this.tab_top ).lineTo( 
      0, this.tab_height );
    this.increment_offset(width);    

  } else if (this.has_chord) { 
    var fret_left = this.current_offset + this.margin_left;
    this.path({stroke: this.color, "stroke-width":1 }).relatively().moveTo( 
        fret_left + this.string_spacing, this.margin_top  ).lineTo(
        0, this.fret_height );
    this.path({stroke: this.color, "stroke-width":4 }).relatively().moveTo( 
        fret_left + this.string_spacing + 6, this.margin_top  ).lineTo(
        0, this.fret_height );
    
    this.increment_offset( this.string_spacing + 6 + this.margin_left + this.margin_right );  
  }
}

// draw a note in a chord
Raphael.fn.chord_note = function (position, string_number, note) {
  // NB: internal string_number in chords counts from low to high
  var fret_number = note[0];
  var fret_left = this.current_offset + this.margin_left;
    
  if (fret_number < 0 ) {
    // muted/not played
    this.text(fret_left + (string_number - 1) * this.string_spacing, this.margin_top - 8, "x").attr({stroke: this.color, "font-size":"9px"});
  } else if (fret_number == 0 ) {
    // open
    this.text(fret_left + (string_number - 1) * this.string_spacing, this.margin_top - 8, "o").attr({stroke: this.color, "font-size":"9px"});
  } else {
    var fret_dy = (fret_number - position + 0.5) * this.fret_spacing;
    //var circle = 
    this.circle(
      fret_left + (string_number - 1) * this.string_spacing, 
      this.margin_top + fret_dy, this.note_radius).attr({stroke: this.color, fill: this.color});
    //circle.attr("fill", "#000");
    //circle.attr("stroke", "#000");
    if ( ! (note[1] === undefined) ) {
      this.text( fret_left + (string_number - 1) * this.string_spacing, 
      this.margin_top + fret_dy, note[1] ).attr({stroke: this.note_text_color, "font-size":"12px"});
    }
  }
  
  if ( this.has_tab && fret_number >= 0 ) {
    this.draw_tab_note( (this.strings_drawn - string_number + 1), fret_number, this.margin_left + this.string_spacing * 2.5 ); 
  }
}

// extend the tab drawing area
Raphael.fn.tab_extend = function (width) {
  if (this.has_tab == false) return;
  for (var i = 0; i < this.strings_drawn; i++ ) {
    this.path({stroke: this.color}).relatively().moveTo(this.current_offset, this.tab_top  + (i * this.tab_spacing) ).lineTo( width, 0 );
  }
}

// start the tab
Raphael.fn.tab_start = function () {
  if (this.has_tab == false) return;
  var width = this.tab_char_width * 3;
  //  start bar
  this.path({stroke: this.color, "stroke-width":1 }).relatively().moveTo(this.current_offset, this.tab_top ).lineTo( 0, this.tab_height );
  // extend tab
  this.tab_extend(width);
  //write TAB
  this.text(this.current_offset + this.tab_char_width, this.tab_top + this.tab_spacing * 1.5, "T").attr({stroke: this.color, "font-size":"14px"});
  this.text(this.current_offset + this.tab_char_width, this.tab_top + this.tab_spacing * 2.5, "A").attr({stroke: this.color, "font-size":"14px"});
  this.text(this.current_offset + this.tab_char_width, this.tab_top + this.tab_spacing * 3.5, "B").attr({stroke: this.color, "font-size":"14px"});
  this.increment_offset(width);
}

/*
// set the tab type and initialize measures
Raphael.fn.set_tabtype = function (tabtype) {
  this.tabtype = tabtype;
  switch  (tabtype) {
    case 1: // chord and tab - already set by default
      this.has_chord = true;
      this.has_tab = true;
      break;
    case 2: // chord only
      this.has_chord = true;
      this.has_tab = false;
      this.total_height = this.chord_height;
      break;
    case 3: // tab only
      this.has_chord = false;
      this.has_tab = true;
      this.tab_top = this.tab_margin_top
      this.total_height = this.tab_top + Raphael.fn.tab_height + Raphael.fn.margin_bottom;
      break;
  }
  this.tab_start();
}
*/


// draw an individual note in the tab
Raphael.fn.draw_tab_note = function (string_number, token, left_offset) {
  // NB: internal string_number in tab counts from high to low
  this.text(this.current_offset + left_offset, 
          this.tab_top + this.tab_spacing * (string_number - 1), 
          token).attr({stroke: this.color, "font-size":"16px"});
}

// draw a token on the tab
Raphael.fn.tab_note = function (token) {
  if (this.has_tab == false) return;
  
  
  if ( token.match( /^\$/ ) != null ) { // contains a string specifier
    if ( token.match( /\./ ) != null ) { // is a multi-string specifier
      var parts = token.split(".");
      var width = 2;
      for (var i = 0; i < parts.length ; i++) { // get the max length of the multi-string specifiers 
        if ( parts[i].length > width ) width = parts[i].length;
      }
      width *= this.tab_char_width + 1;
      this.tab_extend( width );
      for (var i = 0; i < parts.length ; i++) {
        var part = parts[i];
        if ( part.match( /^\$/ ) != null ) {
          this.tab_current_string = part.substr(1,1); 
        } else if ( this.tab_current_string > 0 )  {
          this.draw_tab_note( this.tab_current_string, part, width * 0.5 );
        }
      }
      this.increment_offset( width );
        
    } else { // just a string setting
      this.tab_current_string = token.substr(1,1);
    }
  } else if ( this.tab_current_string > 0 ) { // else draw literal, but only if a current string selected
    var width = this.tab_char_width * ( token.length + 2 );
    //var left_offset = width * 0.5;
    this.tab_extend( width );
    this.draw_tab_note( this.tab_current_string, token, width * 0.5 ); 
    this.increment_offset( width );
  }
}

// main drawing routine entry point: to render a token - chord or tab
Raphael.fn.render_token = function (token) {

  if (jtab.Chords[token] === undefined) { //(typeof(a) != "undefined")
    if (token == "/" ) {
      this.stroke();
    } else if (token == "|" ) {
      this.bar();
    } else if (token == "||" ) {
      this.doublebar();
    } else if ( this.has_tab ) {
      this.tab_note( token );
    }
  } else {
    
    // draw chord
    var ch = jtab.Chords[token][0];    
    this.chord_fretboard(ch[0], token);
    for (var i = 1; i < ch.length ; i++) {  
      this.chord_note(ch[0], i, ch[i]);
    }
    this.increment_offset();
  }
}


//
// define the jtab class
//

var jtab = {
  Version : '1.0',
  Strings : {
  	AboutDialog : '<html><head><title>About jTab</title></head><body style=""><p style="">jTab version: {V}</p><p><a href="http://tardate.com/jtab" target="_blank">http://tardate.com/jtab</a></p><p><input type="button" class="close" value="OK" onClick="window.close()"/></p></body></html>'
  },
  Chords : {
             // chord data - currently explicit representation for 6 string guitar, standard tuning only, and 
             // each chord is an array of alternate positions, currently only 1st position used
             // each position is an array comprising: 1. base fret (1==nut); 2. 6x note definitions (strings 6,5,4,3,2,1)
             // each note is an array: (fret position), (left hand fingering if applicable 1,2,3,4,T)
             // fret position: -1 = muted/not played; 0 = open; 1,2,3... = fret position
    A      : [ [ 1, [-1],  [0  ],  [2,2],  [2,1],  [2,3],  [0  ] ], [  ] ],
    A6     : [ [ 1, [-1],  [0  ],  [2,1],  [2,1],  [2,1],  [2,1] ], [  ] ],
    Am     : [ [ 1, [-1],  [0  ],  [2,2],  [2,3],  [1,1],  [0  ] ], [  ] ],
    Amaj7  : [ [ 1, [-1],  [0  ],  [2,2],  [1,1],  [2,3],  [0  ] ], [  ] ],
    Am7    : [ [ 1, [-1],  [0  ],  [2,2],  [0  ],  [1,1],  [0  ] ], [  ] ],
    A7     : [ [ 1, [-1],  [0  ],  [2,2],  [0  ],  [2,3],  [0  ] ], [  ] ],
      
    "A#"    : [ [ 1, [-1],  [1,1],  [3,3],  [3,3],  [3,3],  [1,1] ], [  ] ],
    "A#6"   : [ [ 1, [-1],  [1,1],  [3,3],  [3,3],  [3,3],  [3,3] ], [  ] ],
    "A#m"   : [ [ 1, [-1],  [1,1],  [3,3],  [3,4],  [2,2],  [1,1] ], [  ] ],
    "A#maj7": [ [ 1, [-1],  [1,1],  [3,3],  [2,2],  [3,4],  [1,1] ], [  ] ],
    "A#m7"  : [ [ 1, [-1],  [1,1],  [3,3],  [1,1],  [2,2],  [1,1] ], [  ] ],
    "A#7"   : [ [ 1, [-1],  [1,1],  [3,3],  [1,1],  [4,4],  [1,1] ], [  ] ],
      
    "Bb"    : [ [ 1, [-1],  [1,1],  [3,3],  [3,3],  [3,3],  [1,1] ], [  ] ],
    "Bb6"   : [ [ 1, [-1],  [1,1],  [3,3],  [3,3],  [3,3],  [3,3] ], [  ] ],
    "Bbm"   : [ [ 1, [-1],  [1,1],  [3,3],  [3,4],  [2,2],  [1,1] ], [  ] ],
    "Bbmaj7": [ [ 1, [-1],  [1,1],  [3,3],  [2,2],  [3,4],  [1,1] ], [  ] ],
    "Bbm7"  : [ [ 1, [-1],  [1,1],  [3,3],  [1,1],  [2,2],  [1,1] ], [  ] ],
    "Bb7"   : [ [ 1, [-1],  [1,1],  [3,3],  [1,1],  [4,4],  [1,1] ], [  ] ],
      
    B      : [ [ 1, [ -1], [2,1],  [4,3],  [4,3],  [4,3],  [2,1] ], [  ] ],
    B6     : [ [ 1, [ -1], [2,1],  [4,3],  [4,3],  [4,3],  [4,3] ], [  ] ],
    Bm     : [ [ 1, [ -1], [2,1],  [4,3],  [4,4],  [3,2],  [2,1] ], [  ] ],
    Bmaj7  : [ [ 1, [ -1], [2,1],  [4,3],  [3,2],  [4,4],  [2,1] ], [  ] ],
    Bm7    : [ [ 1, [ -1], [2,2],  [0  ],  [2,3],  [0  ],  [2,4] ], [  ] ],
    B7     : [ [ 1, [ -1], [2,2],  [1,1],  [2,3],  [0  ],  [2,4] ], [  ] ],

    C      : [ [ 1, [-1 ],  [3,3],  [2,2],  [0  ],  [1,1],  [0  ] ], [  ] ],
    C6     : [ [ 1, [3,4],  [-1 ],  [2,2],  [2,3],  [1,1],  [0  ] ], [  ] ],
    Cm     : [ [ 1, [-1 ],  [3,4],  [1,2],  [0  ],  [1,1],  [-1 ] ], [  ] ],
    Cmaj7  : [ [ 1, [-1 ],  [3,3],  [2,2],  [0  ],  [0  ],  [0  ] ], [  ] ],
    Cm7    : [ [ 1, [-1 ],  [-1 ],  [1,1],  [3,3],  [1,1],  [3,4] ], [  ] ],
    C7     : [ [ 1, [-1 ],  [3,3],  [2,2],  [3,4],  [1,1],  [0  ] ], [  ] ],

    "C#"    : [ [ 1, [-1 ],  [4,4],  [3,4],  [1,1],  [2,2],  [1,1] ], [  ] ],
    "C#6"   : [ [ 1, [-1 ],  [-1 ],  [3,2],  [3,3],  [2,1],  [4,4] ], [  ] ],
    "C#m"   : [ [ 1, [-1 ],  [-1 ],  [2,2],  [1,1],  [3,2],  [0  ] ], [  ] ],
    "C#maj7": [ [ 1, [-1 ],  [4,4],  [3,3],  [1,1],  [1,1],  [1,1] ], [  ] ],
    "C#m7"  : [ [ 1, [-1 ],  [-1 ],  [2,1],  [4,3],  [2,1],  [4,4] ], [  ] ],
    "C#7"   : [ [ 1, [-1 ],  [-1 ],  [3,2],  [4,3],  [2,1],  [4,4] ], [  ] ],

    "Db"    : [ [ 1, [-1 ],  [4,4],  [3,4],  [1,1],  [2,2],  [1,1] ], [  ] ],
    "Db6"   : [ [ 1, [-1 ],  [-1 ],  [3,2],  [3,3],  [2,1],  [4,4] ], [  ] ],
    "Dbm"   : [ [ 1, [-1 ],  [-1 ],  [2,2],  [1,1],  [3,2],  [0  ] ], [  ] ],
    "Dbmaj7": [ [ 1, [-1 ],  [4,4],  [3,3],  [1,1],  [1,1],  [1,1] ], [  ] ],
    "Dbm7"  : [ [ 1, [-1 ],  [-1 ],  [2,1],  [4,3],  [2,1],  [4,4] ], [  ] ],
    "Db7"   : [ [ 1, [-1 ],  [-1 ],  [3,2],  [4,3],  [2,1],  [4,4] ], [  ] ],
      
    D      : [ [ 1, [-1 ],  [0  ],  [0  ],  [2,1],  [3,3],  [2,2] ], [  ] ],
    D6     : [ [ 1, [-1 ],  [0  ],  [0  ],  [2,2],  [0  ],  [2,3] ], [  ] ],
    Dm     : [ [ 1, [-1 ],  [0  ],  [0  ],  [2,2],  [3,3],  [1,1] ], [  ] ],
    Dmaj7  : [ [ 1, [-1 ],  [5,4],  [4,3],  [2,1],  [2,1],  [2,1] ], [  ] ],
    Dm7    : [ [ 1, [-1 ],  [-1 ],  [0  ],  [2,2],  [1,1],  [1,1] ], [  ] ],
    D7     : [ [ 1, [-1 ],  [0  ],  [0  ],  [2,2],  [1,1],  [2,3] ], [  ] ],
    Dsus4  : [ [ 1, [-1 ],  [-1 ],  [0  ],  [2,1],  [3,3],  [3,4] ], [  ] ],

    "D#"    : [ [ 1, [-1 ],  [-1 ],  [5,4],  [3,1],  [4,3],  [3,2] ], [  ] ],
    "D#6"   : [ [ 1, [-1 ],  [3,1],  [5,3],  [3,1],  [4,2],  [3,1] ], [  ] ],
    "D#m"   : [ [ 1, [-1 ],  [-1 ],  [4,3],  [3,2],  [4,4],  [2,1] ], [  ] ],
    "D#maj7": [ [ 1, [-1 ],  [-1 ],  [1,1],  [3,2],  [3,3],  [3,4] ], [  ] ],
    "D#m7"  : [ [ 1, [-1 ],  [-1 ],  [1,1],  [3,4],  [2,2],  [2,3] ], [  ] ],
    "D#7"   : [ [ 1, [-1 ],  [-1 ],  [1,1],  [3,3],  [2,2],  [3,4] ], [  ] ],
      
    "Eb"    : [ [ 1, [-1 ],  [-1 ],  [5,4],  [3,1],  [4,3],  [3,2] ], [  ] ],
    "Eb6"   : [ [ 1, [-1 ],  [3,1],  [5,3],  [3,1],  [4,2],  [3,1] ], [  ] ],
    "Ebm"   : [ [ 1, [-1 ],  [-1 ],  [4,3],  [3,2],  [4,4],  [2,1] ], [  ] ],
    "Ebmaj7": [ [ 1, [-1 ],  [-1 ],  [1,1],  [3,2],  [3,3],  [3,4] ], [  ] ],
    "Ebm7"  : [ [ 1, [-1 ],  [-1 ],  [1,1],  [3,4],  [2,2],  [2,3] ], [  ] ],
    "Eb7"   : [ [ 1, [-1 ],  [-1 ],  [1,1],  [3,3],  [2,2],  [3,4] ], [  ] ],

    E      : [ [ 1, [ 0 ],  [2,2],  [2,3],  [1,1],  [0  ],  [0  ] ], [  ] ],
    E6     : [ [ 1, [ 0 ],  [2,2],  [2,3],  [1,1],  [2,4],  [0  ] ], [  ] ],
    Em     : [ [ 1, [ 0 ],  [2,2],  [2,3],  [0  ],  [0  ],  [0  ] ], [  ] ],
    Emaj7  : [ [ 1, [ 0 ],  [2,3],  [1,1],  [1,2],  [0  ],  [0  ] ], [  ] ],
    Em7    : [ [ 1, [ 0 ],  [2,2],  [2,3],  [0  ],  [3,4],  [0  ] ], [  ] ],
    E7     : [ [ 1, [ 0 ],  [2,2],  [0  ],  [1,1],  [0  ],  [0  ] ], [  ] ],

    F      : [ [ 1, [1,1],  [3,3],  [3,4],  [2,2],  [1,1],  [1,1] ], [  ] ],
    F6     : [ [ 1, [1,1],  [3,3],  [-1 ],  [2,2],  [3,4],  [-1 ] ], [  ] ],
    Fm     : [ [ 1, [1,1],  [3,3],  [3,4],  [1,1],  [1,1],  [1,1] ], [  ] ],
    Fmaj7  : [ [ 1, [1,1],  [-1 ],  [2,3],  [2,4],  [1,2],  [-1 ] ], [  ] ],
    Fm7    : [ [ 1, [1,1],  [3,3],  [3,4],  [1,1],  [4,4],  [1,1] ], [  ] ],
    F7     : [ [ 1, [1,1],  [3,3],  [1,1],  [2,2],  [1,1],  [1,1] ], [  ] ],

    "F#"    : [ [ 1, [2,1],  [4,3],  [4,4],  [3,2],  [2,1],  [2,1] ], [  ] ],
    "F#6"   : [ [ 1, [2,1],  [4,3],  [-1 ],  [3,2],  [4,4],  [-1 ] ], [  ] ],
    "F#m"   : [ [ 1, [2,1],  [4,3],  [4,4],  [2,1],  [2,1],  [2,1] ], [  ] ],
    "F#maj7": [ [ 1, [2,1],  [-1 ],  [3,3],  [3,4],  [2,2],  [-1 ] ], [  ] ],
    "F#m7"  : [ [ 1, [2,1],  [4,3],  [4,4],  [2,1],  [5,4],  [2,1] ], [  ] ],
    "F#7"   : [ [ 1, [2,1],  [4,3],  [2,1],  [3,2],  [2,1],  [2,1] ], [  ] ],

    "Gb"    : [ [ 1, [2,1],  [4,3],  [4,4],  [3,2],  [2,1],  [2,1] ], [  ] ],
    "Gb6"   : [ [ 1, [2,1],  [4,3],  [-1 ],  [3,2],  [4,4],  [-1 ] ], [  ] ],
    "Gbm"   : [ [ 1, [2,1],  [4,3],  [4,4],  [2,1],  [2,1],  [2,1] ], [  ] ],
    "Gbmaj7": [ [ 1, [2,1],  [-1 ],  [3,3],  [3,4],  [2,2],  [-1 ] ], [  ] ],
    "Gbm7"  : [ [ 1, [2,1],  [4,3],  [4,4],  [2,1],  [5,4],  [2,1] ], [  ] ],
    "Gb7"   : [ [ 1, [2,1],  [4,3],  [2,1],  [3,2],  [2,1],  [2,1] ], [  ] ],

    G      : [ [ 1, [3,3],  [2,2],  [0  ],  [0  ],  [0  ],  [3,4] ], [  ] ],
    G6     : [ [ 1, [3,3],  [2,2],  [0  ],  [0  ],  [0  ],  [0  ] ], [  ] ],
    Gm     : [ [ 1, [2,3],  [1,1],  [0  ],  [0  ],  [3,3],  [3,4] ], [  ] ],
    Gmaj7  : [ [ 1, [3,3],  [2,2],  [0  ],  [0  ],  [0  ],  [2,1] ], [  ] ],
    Gm7    : [ [ 1, [-1 ],  [1,1],  [3,3],  [0  ],  [3,4],  [-1 ] ], [  ] ],
    G7     : [ [ 1, [3,3],  [2,2],  [0  ],  [0  ],  [0  ],  [1,1] ], [  ] ],

    "G#"     : [ [ 1, [4,4],  [3,3],  [1,1],  [1,1],  [1,1],  [-1 ] ], [  ] ],      
    "G#6"    : [ [ 1, [-1 ],  [-1 ],  [1,1],  [1,1],  [1,1],  [1,1] ], [  ] ],      
    "G#m"    : [ [ 1, [-1 ],  [2,2],  [1,1],  [1,1],  [4,4],  [4,4] ], [  ] ],      
    "G#maj7" : [ [ 1, [-1 ],  [-1 ],  [1,1],  [1,1],  [1,1],  [3,3] ], [  ] ],      
    "G#m7"   : [ [ 3, [4,1],  [6,3],  [4,1],  [4,1],  [7,4],  [4,1] ], [  ] ],        
    "G#7"    : [ [ 1, [-1 ],  [-1 ],  [1,1],  [1,1],  [1,1],  [2,2] ], [  ] ],      

    "Ab"     : [ [ 1, [4,4],  [3,3],  [1,1],  [1,1],  [1,1],  [-1 ] ], [  ] ],      
    "Ab6"    : [ [ 1, [-1 ],  [-1 ],  [1,1],  [1,1],  [1,1],  [1,1] ], [  ] ],      
    "Abm"    : [ [ 1, [-1 ],  [2,2],  [1,1],  [1,1],  [4,4],  [4,4] ], [  ] ],      
    "Abmaj7" : [ [ 1, [-1 ],  [-1 ],  [1,1],  [1,1],  [1,1],  [3,3] ], [  ] ],      
    "Abm7"   : [ [ 3, [4,1],  [6,3],  [4,1],  [4,1],  [7,4],  [4,1] ], [  ] ],      
    "Ab7"    : [ [ 1, [-1 ],  [-1 ],  [1,1],  [1,1],  [1,1],  [2,2] ], [  ] ]      

  }
};


// determine nature of the token stream
jtab.characterize = function (notation) {
  var tabtype = 0;
  var gotChord = ( notation.match( /[A-G]/ ) != null );
  var gotTab = ( notation.match( /\$/ ) != null );
  if ( gotChord && gotTab ) { // chord and tab - already set by default
    tabtype = 1;
    Raphael.fn.has_chord = true;
    Raphael.fn.has_tab = true;
    Raphael.fn.tab_top = Raphael.fn.chord_height + Raphael.fn.tab_margin_top;
    Raphael.fn.total_height = Raphael.fn.tab_top + Raphael.fn.tab_height + Raphael.fn.margin_bottom;
  } else if ( gotChord ) { // chord only
    tabtype = 2;
    Raphael.fn.has_chord = true;
    Raphael.fn.has_tab = false;
    Raphael.fn.tab_top = Raphael.fn.chord_height + Raphael.fn.tab_margin_top;
    Raphael.fn.total_height = Raphael.fn.chord_height;
  } else if ( gotTab ) { // tab only
    tabtype = 3;
    Raphael.fn.has_chord = false;
    Raphael.fn.has_tab = true;
    Raphael.fn.tab_top = Raphael.fn.tab_margin_top;
    Raphael.fn.total_height = Raphael.fn.tab_top + Raphael.fn.tab_height + Raphael.fn.margin_bottom;
  }
  Raphael.fn.tabtype = tabtype;    
  return tabtype;
}

// main render entry point
jtab.render = function (element,notation) {

  var tabtype = jtab.characterize( notation );
  if (tabtype == 0 ) return;
  
  // add the Raphael canvas in its own DIV. this gets around an IE6 issue with not removing previous renderings
  var canvas_holder = new Element('div').setStyle({height: Raphael.fn.total_height});
  $(element).update(canvas_holder);
  canvas = Raphael(canvas_holder, 80, Raphael.fn.total_height );
  canvas.tab_start();
  
  //canvas.render_notation( notation );
  var tokens = notation.split(/\s/);
  for(var i = 0; i < tokens.length; i++) {
    canvas.render_token(tokens[i]);
  }
}

// process implicit rendering of tags with class 'jtab'
jtab.renderimplicit = function() {
  $$('.jtab').each( function(name, index) { jtab.render(name,name.innerHTML); } );
}

// initialize jtab - setup to run implicit rendering on window.onload
jtab.init = function() {
  if (typeof window.onload != 'function') {
    window.onload = jtab.renderimplicit;
  } else {
    var oldonload = window.onload;
    window.onload = function() {
      if (oldonload) {
        oldonload();
      }
      jtab.renderimplicit();
    }
  }
}

// bootstrap jtab
jtab.init();
