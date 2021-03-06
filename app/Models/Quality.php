<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * App\Models\Quality
 *
 * @property int $id
 * @property string $value
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\Field[] $fields
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\Range[] $ranges
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\Tolerance[] $tolerances
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Quality whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Quality whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Quality whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Quality whereValue($value)
 * @mixin \Eloquent
 */
class Quality extends Model
{
    /**
     * @var array
     */
  protected $fillable = ['value'];

    /**
     * @return array
     */
  public static function getRules()
  {
      return [
          'value' => 'required|digits_between:1,2',
      ];
  }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
  public function tolerances()
  {
      return $this->hasMany(Tolerance::class);
  }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasManyThrough
     */
  public function fields()
  {
      return $this->hasManyThrough(Field::class, Tolerance::class);
  }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasManyThrough
     */
  public function ranges()
  {
      return $this->hasManyThrough(Range::class, Tolerance::class);
  }
}
